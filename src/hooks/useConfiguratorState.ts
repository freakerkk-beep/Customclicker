import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ClickerCustomData, KeyItem } from '../../shared/orderSchema';
import type { ProductConfig, SwitchType } from '../types/product';
import { clearDesign, loadDesign, saveDesign } from '../utils/storage';

export interface DesignState {
  characterCount: number;
  colorPaletteId: string;
  switchType: SwitchType;
  /**
   * Mảng LUÔN dài bằng maxCharacters.
   * Khi khách giảm số ký tự, dữ liệu các phím dư vẫn nằm đây để tăng lại là có
   * ngay — nhưng chỉ `characterCount` phím đầu được đưa vào đơn hàng.
   */
  keys: KeyItem[];
  quantity: number;
}

function emptyKey(): KeyItem {
  return { type: 'text', value: '' };
}

function buildInitialState(product: ProductConfig): DesignState {
  return {
    characterCount: product.pricing.minCharacters,
    colorPaletteId: product.palettes[0]?.id ?? '',
    switchType: product.switches[0]?.id ?? 'clicky',
    keys: Array.from({ length: product.pricing.maxCharacters }, emptyKey),
    quantity: 1,
  };
}

/** Đảm bảo state đọc từ localStorage vẫn hợp lệ với cấu hình sản phẩm hiện tại. */
function reconcile(state: DesignState, product: ProductConfig): DesignState {
  const { minCharacters, maxCharacters } = product.pricing;
  const keys = [...(state.keys ?? [])].slice(0, maxCharacters);
  while (keys.length < maxCharacters) keys.push(emptyKey());

  return {
    characterCount: Math.min(
      Math.max(state.characterCount ?? minCharacters, minCharacters),
      maxCharacters,
    ),
    colorPaletteId: product.palettes.some((p) => p.id === state.colorPaletteId)
      ? state.colorPaletteId
      : (product.palettes[0]?.id ?? ''),
    switchType: product.switches.some((s) => s.id === state.switchType)
      ? state.switchType
      : (product.switches[0]?.id ?? 'clicky'),
    keys: keys.map((key) => {
      if (!key) return emptyKey();
      if (key.type === 'text') return key;
      if (key.type === 'icon' && product.icons.some((icon) => icon.id === key.iconId)) return key;
      // Bản nháp cũ có icon đã bị loại khỏi danh mục: xoá nội dung để khách chọn lại,
      // tránh preview trống hoặc backend từ chối đơn.
      return emptyKey();
    }),
    quantity: Math.min(Math.max(state.quantity ?? 1, 1), 20),
  };
}

export interface ConfiguratorApi {
  state: DesignState;
  /** Dữ liệu sẽ thực sự được gửi lên server (đã cắt theo characterCount). */
  customData: ClickerCustomData;
  /** true khi khách đã chỉnh gì đó — dùng để hỏi trước khi rời trang. */
  isDirty: boolean;
  /** Có bản thiết kế cũ để khôi phục sau khi bấm "Bắt đầu lại" hay không. */
  canRestore: boolean;
  setCharacterCount: (count: number) => void;
  setPalette: (paletteId: string) => void;
  setSwitchType: (switchType: SwitchType) => void;
  setKey: (index: number, key: KeyItem) => void;
  clearKey: (index: number) => void;
  setQuantity: (quantity: number) => void;
  reset: () => void;
  restorePrevious: () => void;
  /** Xoá bản nháp sau khi đặt hàng thành công. */
  commit: () => void;
}

/**
 * Quản lý toàn bộ trạng thái thiết kế của một sản phẩm.
 * Tự lưu nháp vào localStorage để tải lại trang không mất dữ liệu.
 */
export function useConfiguratorState(product: ProductConfig): ConfiguratorApi {
  const initial = useMemo(() => buildInitialState(product), [product]);

  const [state, setState] = useState<DesignState>(() => {
    const saved = loadDesign<DesignState>(product.slug);
    return saved ? reconcile(saved.data, product) : initial;
  });

  const [isDirty, setIsDirty] = useState(false);
  const [snapshot, setSnapshot] = useState<DesignState | null>(null);
  const committed = useRef(false);

  // Lưu nháp mỗi khi thiết kế đổi.
  useEffect(() => {
    if (committed.current) return;
    saveDesign(product.slug, state);
  }, [product.slug, state]);

  const update = useCallback((updater: (current: DesignState) => DesignState) => {
    setIsDirty(true);
    setState(updater);
  }, []);

  const setCharacterCount = useCallback(
    (count: number) => {
      const { minCharacters, maxCharacters } = product.pricing;
      const next = Math.min(Math.max(count, minCharacters), maxCharacters);
      // Không đụng vào mảng keys: dữ liệu phím dư được giữ nguyên,
      // chỉ `characterCount` quyết định phím nào thuộc đơn hàng.
      update((current) => ({ ...current, characterCount: next }));
    },
    [product.pricing, update],
  );

  const setPalette = useCallback(
    (colorPaletteId: string) => update((current) => ({ ...current, colorPaletteId })),
    [update],
  );

  const setSwitchType = useCallback(
    (switchType: SwitchType) => update((current) => ({ ...current, switchType })),
    [update],
  );

  const setKey = useCallback(
    (index: number, key: KeyItem) =>
      update((current) => {
        const keys = [...current.keys];
        keys[index] = key;
        return { ...current, keys };
      }),
    [update],
  );

  const clearKey = useCallback((index: number) => setKey(index, emptyKey()), [setKey]);

  const setQuantity = useCallback(
    (quantity: number) =>
      update((current) => ({ ...current, quantity: Math.min(Math.max(quantity, 1), 20) })),
    [update],
  );

  const reset = useCallback(() => {
    // Giữ lại bản cũ để khách bấm "Khôi phục thiết kế trước" nếu lỡ tay.
    setSnapshot(state);
    setState(buildInitialState(product));
    setIsDirty(false);
    clearDesign(product.slug);
  }, [product, state]);

  const restorePrevious = useCallback(() => {
    if (!snapshot) return;
    setState(snapshot);
    setSnapshot(null);
    setIsDirty(true);
  }, [snapshot]);

  const commit = useCallback(() => {
    committed.current = true;
    setIsDirty(false);
    clearDesign(product.slug);
  }, [product.slug]);

  const customData = useMemo<ClickerCustomData>(
    () => ({
      characterCount: state.characterCount,
      colorPaletteId: state.colorPaletteId,
      switchType: state.switchType,
      // Chỉ những phím đang hiển thị mới thuộc đơn hàng.
      keys: state.keys.slice(0, state.characterCount),
    }),
    [state],
  );

  return {
    state,
    customData,
    isDirty,
    canRestore: snapshot !== null,
    setCharacterCount,
    setPalette,
    setSwitchType,
    setKey,
    clearKey,
    setQuantity,
    reset,
    restorePrevious,
    commit,
  };
}
