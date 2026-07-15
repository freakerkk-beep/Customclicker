import { LIMITS } from '../../shared/constants';
import { isValidVnPhone, normalizePhone } from '../../shared/phone';
import { countGraphemes } from '../../shared/sanitize';
import type { ClickerCustomData } from '../../shared/orderSchema';
import type { ProductConfig } from '../types/product';

export { isValidVnPhone, normalizePhone };

export interface FieldErrors {
  [field: string]: string;
}

/** Chặn mọi ký tự không phải số / dấu + khi khách gõ số điện thoại. */
export function filterPhoneInput(value: string): string {
  return value.replace(/[^\d+\s.-]/g, '').slice(0, 15);
}

/** Chỉ tính các phím đang thực sự thuộc đơn hàng (theo characterCount hiện tại). */
export function getActiveKeys(data: ClickerCustomData) {
  return data.keys.slice(0, data.characterCount);
}

/** Trả về danh sách index (bắt đầu từ 0) của những phím chưa có nội dung. */
export function findEmptyKeyIndexes(data: ClickerCustomData): number[] {
  const empty: number[] = [];
  getActiveKeys(data).forEach((key, index) => {
    if (key.type === 'text' && key.value.trim().length === 0) empty.push(index);
    if (key.type === 'icon' && !key.iconId) empty.push(index);
  });
  return empty;
}

/** Kiểm tra phần thiết kế đã đủ điều kiện đặt hàng chưa. */
export function validateDesign(data: ClickerCustomData, product: ProductConfig): FieldErrors {
  const errors: FieldErrors = {};

  if (
    data.characterCount < product.pricing.minCharacters ||
    data.characterCount > product.pricing.maxCharacters
  ) {
    errors.characterCount = `Số ký tự phải từ ${product.pricing.minCharacters} đến ${product.pricing.maxCharacters}.`;
  }

  if (!product.palettes.some((p) => p.id === data.colorPaletteId)) {
    errors.colorPaletteId = 'Vui lòng chọn một bộ màu.';
  }

  if (!product.switches.some((s) => s.id === data.switchType)) {
    errors.switchType = 'Vui lòng chọn loại switch.';
  }

  const empty = findEmptyKeyIndexes(data);
  if (empty.length > 0) {
    errors.keys = `Phím ${empty.map((i) => i + 1).join(', ')} chưa có nội dung.`;
  }

  const invalidIconIndex = getActiveKeys(data).findIndex(
    (k) => k.type === 'icon' && !product.icons.some((icon) => icon.id === k.iconId),
  );
  if (invalidIconIndex >= 0) {
    errors.keys = `Phím ${invalidIconIndex + 1} có icon không hợp lệ.`;
  }

  const invalidLengthIndex = getActiveKeys(data).findIndex(
    (k) => k.type === 'text' && countGraphemes(k.value) !== LIMITS.keyTextMaxLength,
  );
  if (invalidLengthIndex >= 0) {
    errors.keys = `Phím ${invalidLengthIndex + 1} chỉ được nhập đúng 1 ký tự.`;
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
