import { AlertCircle, Eraser, Type as TypeIcon } from 'lucide-react';
import { LIMITS } from '../../../shared/constants';
import type { KeyItem } from '../../../shared/orderSchema';
import type { ColorPalette, ProductConfig } from '../../types/product';
import { getIconComponent } from '../../utils/icons';
import Card, { CardTitle } from '../ui/Card';

interface KeyCustomizerProps {
  product: ProductConfig;
  keys: KeyItem[];
  characterCount: number;
  palette: ColorPalette | undefined;
  onSetKey: (index: number, key: KeyItem) => void;
  onClearKey: (index: number) => void;
}

/** Phím thu nhỏ hiển thị đúng màu đang chọn. */
function MiniKeyPreview({ item, palette }: { item: KeyItem; palette: ColorPalette | undefined }) {
  const Icon = item.type === 'icon' ? getIconComponent(item.iconId) : null;
  const keyColor = palette?.key ?? '#EBD9C3';
  const textColor = palette?.text ?? '#5F3B22';

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-black/5 shadow-sm"
      style={{ backgroundColor: keyColor }}
      aria-hidden="true"
    >
      {Icon ? (
        <Icon className="h-5 w-5" style={{ color: textColor }} />
      ) : (
        <span
          className="max-w-full truncate px-1 text-[10px] font-bold leading-none"
          style={{ color: textColor }}
        >
          {item.type === 'text' ? item.value || '—' : '—'}
        </span>
      )}
    </div>
  );
}

export default function KeyCustomizer({
  product,
  keys,
  characterCount,
  palette,
  onSetKey,
  onClearKey,
}: KeyCustomizerProps) {
  // Chỉ hiện đúng số phím khách đang chọn. Phím dư vẫn nằm trong state
  // (tăng số ký tự lại là có ngay) nhưng không thuộc đơn hàng.
  const visibleKeys = keys.slice(0, characterCount);

  return (
    <Card>
      <CardTitle hint={`Mỗi phím tối đa ${LIMITS.keyTextMaxLength} ký tự, có dấu tiếng Việt cũng được.`}>
        Nội dung từng phím
      </CardTitle>

      <ul className="space-y-3">
        {visibleKeys.map((item, index) => {
          const isText = item.type === 'text';
          const textValue = isText ? item.value : '';
          const tooLong = textValue.length > LIMITS.keyTextMaxLength;
          const onlySpaces = isText && textValue.length > 0 && textValue.trim().length === 0;
          const inputId = `key-${index}-text`;

          return (
            <li key={index} className="rounded-xl border border-line bg-white p-3">
              <div className="flex items-start gap-3">
                <span className="mt-2.5 w-6 shrink-0 text-center text-sm font-semibold text-ink-muted">
                  {index + 1}
                </span>

                <MiniKeyPreview item={item} palette={palette} />

                <div className="min-w-0 flex-1">
                  {/* Chọn kiểu nội dung: chữ hoặc icon */}
                  <div
                    className="mb-2 inline-flex rounded-lg border border-line p-0.5"
                    role="radiogroup"
                    aria-label={`Kiểu nội dung phím ${index + 1}`}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isText}
                      onClick={() => onSetKey(index, { type: 'text', value: textValue })}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        isText ? 'bg-primary text-white' : 'text-ink-muted hover:bg-primary-soft/50'
                      }`}
                    >
                      <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Chữ
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!isText}
                      onClick={() =>
                        onSetKey(index, {
                          type: 'icon',
                          iconId: item.type === 'icon' ? item.iconId : (product.icons[0]?.id ?? 'heart'),
                        })
                      }
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        !isText ? 'bg-primary text-white' : 'text-ink-muted hover:bg-primary-soft/50'
                      }`}
                    >
                      ♥ Icon
                    </button>
                  </div>

                  {isText ? (
                    <div>
                      <label htmlFor={inputId} className="sr-only">
                        Nội dung phím {index + 1}
                      </label>
                      <input
                        id={inputId}
                        type="text"
                        value={textValue}
                        maxLength={LIMITS.keyTextMaxLength}
                        onChange={(event) => onSetKey(index, { type: 'text', value: event.target.value })}
                        onBlur={(event) =>
                          onSetKey(index, { type: 'text', value: event.target.value.trim() })
                        }
                        placeholder={`Nội dung phím ${index + 1}`}
                        className={`field-input py-2 text-sm ${tooLong || onlySpaces ? 'field-input-error' : ''}`}
                        aria-invalid={tooLong || onlySpaces}
                      />
                      <div className="mt-1 flex items-center justify-between gap-2">
                        {tooLong ? (
                          <span className="field-error">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            Tối đa {LIMITS.keyTextMaxLength} ký tự.
                          </span>
                        ) : onlySpaces ? (
                          <span className="field-error">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            Nội dung không thể chỉ có khoảng trắng.
                          </span>
                        ) : (
                          <span />
                        )}
                        <span
                          className={`shrink-0 text-[11px] ${tooLong ? 'text-red-600' : 'text-ink-muted'}`}
                        >
                          {textValue.length}/{LIMITS.keyTextMaxLength}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-wrap gap-1.5"
                      role="radiogroup"
                      aria-label={`Chọn icon cho phím ${index + 1}`}
                    >
                      {product.icons.map((icon) => {
                        const Icon = getIconComponent(icon.id);
                        const selected = item.type === 'icon' && item.iconId === icon.id;
                        if (!Icon) return null;
                        return (
                          <button
                            key={icon.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            title={icon.label}
                            aria-label={icon.label}
                            onClick={() => onSetKey(index, { type: 'icon', iconId: icon.id })}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                              selected
                                ? 'border-primary bg-primary text-white'
                                : 'border-line bg-white text-ink-muted hover:border-primary/40 hover:text-primary'
                            }`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onClearKey(index)}
                  aria-label={`Xoá nội dung phím ${index + 1}`}
                  title="Xoá nội dung"
                  className="mt-1.5 shrink-0 rounded-lg p-2 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Eraser className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
