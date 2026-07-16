import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { LIMITS } from '../../../shared/constants';
import { countGraphemes, normalizeKeycapText } from '../../../shared/sanitize';
import type { KeyItem } from '../../../shared/orderSchema';
import type { ColorPalette, ProductConfig } from '../../types/product';
import { getIconComponent } from '../../utils/icons';

interface KeyCustomizerProps {
  product: ProductConfig;
  keys: KeyItem[];
  characterCount: number;
  palette: ColorPalette | undefined;
  onSetKey: (index: number, key: KeyItem) => void;
  errorMessage?: string;
}

const FALLBACK = {
  tray: '#B93338',
  key: '#F1BAC4',
  text: '#7E2934',
};

export default function KeyCustomizer({
  product,
  keys,
  characterCount,
  palette,
  onSetKey,
  errorMessage,
}: KeyCustomizerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(characterCount - 1, 0)));
  }, [characterCount]);

  const colors = palette ?? { ...FALLBACK, id: 'fallback', name: 'fallback', code: 'fallback' };
  const visibleKeys = useMemo(() => keys.slice(0, characterCount), [keys, characterCount]);
  const activeKey = visibleKeys[activeIndex] ?? { type: 'text', value: '' as const };
  const isText = activeKey.type === 'text';
  const textValue = isText ? activeKey.value : '';
  const textLength = countGraphemes(textValue);
  const emptyText = isText && textLength === 0;
  const columns = characterCount <= 6 ? characterCount : characterCount <= 8 ? 4 : characterCount <= 10 ? 5 : 6;
  const keyGap = 8;
  const keyBasis = `calc((100% - ${(columns - 1) * keyGap}px) / ${columns})`;

  const setTextMode = () => {
    const currentValue = activeKey.type === 'text' ? activeKey.value : '';
    onSetKey(activeIndex, { type: 'text', value: normalizeKeycapText(currentValue, 1) });
  };

  const setIconMode = () => {
    const defaultIcon = activeKey.type === 'icon' ? activeKey.iconId : product.icons[0]?.id ?? 'heart';
    onSetKey(activeIndex, { type: 'icon', iconId: defaultIcon });
  };

  return (
    <section>
      <div className="text-center">
        <p className="text-sm font-semibold text-ink-muted">Đang chỉnh Phím {activeIndex + 1} ✏️</p>
      </div>

      <div className="mx-auto mt-4 w-full max-w-[480px] rounded-[28px] px-4 py-5" style={{ backgroundColor: colors.tray }}>
        <div className="flex flex-wrap items-end justify-center" style={{ gap: keyGap }}>
          {visibleKeys.map((item, index) => {
            const Icon = item.type === 'icon' ? getIconComponent(item.iconId) : null;
            const selected = index === activeIndex;
            const text = item.type === 'text' ? item.value : '';

            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={selected}
                className={[
                  'relative flex aspect-square shrink-0 items-center justify-center rounded-[18px] border-2 shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)] transition-all',
                  selected ? 'border-white ring-4 ring-primary-soft/80' : 'border-transparent',
                ].join(' ')}
                style={{ backgroundColor: colors.key, flexBasis: keyBasis, maxWidth: keyBasis }}
              >
                {Icon ? (
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: colors.text }} aria-hidden="true" />
                ) : (
                  <span
                    className="font-key text-3xl font-black leading-none sm:text-4xl"
                    style={{ color: colors.text }}
                  >
                    {text || '·'}
                  </span>
                )}
                <span
                  className="pointer-events-none absolute bottom-2 right-3 text-[11px] font-bold"
                  style={{ color: colors.text, opacity: 0.85 }}
                >
                  S{index + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-bold uppercase tracking-wide text-brandPurple">
          Đang chỉnh — Phím {activeIndex + 1}
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={setTextMode}
            className={[
              'rounded-2xl border px-4 py-3 text-center text-lg font-semibold transition-all',
              isText
                ? 'border-primary bg-primary text-white shadow-soft'
                : 'border-line bg-white text-primary hover:bg-primary-soft/30',
            ].join(' ')}
          >
            Aa Chữ / Số
          </button>
          <button
            type="button"
            onClick={setIconMode}
            className={[
              'rounded-2xl border px-4 py-3 text-center text-lg font-semibold transition-all',
              !isText
                ? 'border-primary bg-primary text-white shadow-soft'
                : 'border-line bg-white text-primary hover:bg-primary-soft/30',
            ].join(' ')}
          >
            ✦ Icon
          </button>
        </div>

        {isText ? (
          <div className="mt-4">
            <input
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              value={textValue}
              onChange={(event) =>
                onSetKey(activeIndex, {
                  type: 'text',
                  value: normalizeKeycapText(event.target.value, LIMITS.keyTextMaxLength),
                })
              }
              placeholder="A"
              className={`field-input text-2xl font-key font-black uppercase ${emptyText ? 'field-input-error' : ''}`}
              aria-invalid={emptyText}
            />
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <p className={emptyText ? 'text-red-600' : 'text-ink-muted'}>
                {emptyText
                  ? 'Phím này chưa có nội dung.'
                  : 'Tự động viết IN HOA. Mỗi phím chỉ 1 ký tự.'}
              </p>
              <span className={`shrink-0 font-medium ${emptyText ? 'text-red-600' : 'text-ink-muted'}`}>
                {textLength}/{LIMITS.keyTextMaxLength}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5" role="radiogroup" aria-label={`Chọn icon cho phím ${activeIndex + 1}`}>
            {product.icons.map((icon) => {
              const Icon = getIconComponent(icon.id);
              const selected = activeKey.type === 'icon' && activeKey.iconId === icon.id;
              if (!Icon) return null;

              return (
                <button
                  key={icon.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={icon.label}
                  aria-label={icon.label}
                  onClick={() => onSetKey(activeIndex, { type: 'icon', iconId: icon.id })}
                  className={[
                    'flex h-16 items-center justify-center rounded-2xl border transition-all',
                    selected
                      ? 'border-primary bg-primary-soft/70 ring-2 ring-primary/20'
                      : 'border-line bg-white hover:bg-primary-soft/30',
                  ].join(' ')}
                  style={{ color: colors.text }}
                >
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        )}

        {errorMessage ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary-soft/35 px-4 py-3 text-sm text-ink-muted">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Mỗi phím bắt buộc có đúng 1 ký tự hoặc 1 icon.
        </div>
      </div>
    </section>
  );
}
