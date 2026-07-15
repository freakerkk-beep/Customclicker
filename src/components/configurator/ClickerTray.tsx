import type { CSSProperties } from 'react';
import { countGraphemes } from '../../../shared/sanitize';
import type { KeyItem } from '../../../shared/orderSchema';
import type { ColorPalette, SwitchType } from '../../types/product';
import { getIconComponent } from '../../utils/icons';

interface ClickerTrayProps {
  keys: KeyItem[];
  palette: ColorPalette | undefined;
  switchType: SwitchType;
}

const FALLBACK: ColorPalette = {
  id: 'fallback',
  name: 'Mặc định',
  tray: '#C9A227',
  key: '#EBD9C3',
  text: '#5F3B22',
};

/**
 * Khay clicker dựng hoàn toàn bằng HTML/CSS — không dùng ảnh cố định,
 * nên mọi cấu hình màu / số phím / nội dung đều hiển thị đúng.
 *
 * Cách thu nhỏ: khay là một CSS container, mọi kích thước bên trong tính bằng
 * đơn vị `cqw` (phần trăm chiều rộng container). Nhờ vậy khay tự vừa khung ở
 * mọi độ rộng — từ điện thoại tới desktop — mà không cần JavaScript đo đạc.
 */
export default function ClickerTray({ keys, palette, switchType }: ClickerTrayProps) {
  const colors = palette ?? FALLBACK;
  const count = Math.max(keys.length, 1);

  const padding = 3;
  const gap = count > 8 ? 1.2 : 1.8;
  const keyWidth = (100 - padding * 2 - gap * (count - 1)) / count;
  const keyHeight = keyWidth * 1.12;
  const radius = keyWidth * 0.18;

  /**
   * Cỡ chữ tự co theo nội dung DÀI NHẤT trên khay.
   * Nếu để cỡ chữ cố định, phím 4 ký tự ("2025") sẽ bị cắt cụt — mà đây là bản
   * xem trước của hàng in thật nên không được phép hiển thị sai.
   * Mọi phím dùng chung một cỡ chữ để nhìn đều tay.
   */
  const longest = keys.reduce(
    (max, item) => (item.type === 'text' ? Math.max(max, countGraphemes(item.value)) : max),
    1,
  );
  // Bề rộng khả dụng trong phím (trừ padding hai bên), chia cho số ký tự.
  // Hệ số 0.62 ≈ bề ngang trung bình một ký tự so với cỡ chữ của font Bold.
  const fitBy = (keyWidth * 0.82) / (longest * 0.62);
  const fontSize = Math.max(Math.min(keyWidth * 0.34, fitBy), 0.8);

  const trayStyle: CSSProperties = {
    containerType: 'inline-size',
    backgroundColor: colors.tray,
    padding: `${padding}cqw`,
    borderRadius: `${padding * 1.6}cqw`,
  };

  return (
    <div className="w-full" style={{ containerType: 'inline-size' }}>
      <div
        className="w-full shadow-lift"
        style={{
          ...trayStyle,
          // Vành khay: gờ sáng trên, bóng đổ dưới cho có khối.
          boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.35), inset 0 -3px 8px rgba(0,0,0,0.18), 0 6px 22px rgba(122,55,50,0.15)',
        }}
      >
        <div className="flex w-full items-end" style={{ gap: `${gap}cqw` }}>
          {keys.map((item, index) => {
            const Icon = item.type === 'icon' ? getIconComponent(item.iconId) : null;
            const text = item.type === 'text' ? item.value : '';

            return (
              <div
                key={index}
                className="flex shrink-0 items-center justify-center overflow-hidden"
                style={{
                  width: `${keyWidth}cqw`,
                  height: `${keyHeight}cqw`,
                  backgroundColor: colors.key,
                  borderRadius: `${radius}cqw`,
                  boxShadow:
                    'inset 0 -0.6cqw 0 rgba(0,0,0,0.12), inset 0 0.4cqw 0 rgba(255,255,255,0.5)',
                }}
              >
                {Icon ? (
                  <Icon
                    style={{
                      width: `${keyWidth * 0.5}cqw`,
                      height: `${keyWidth * 0.5}cqw`,
                      color: colors.text,
                    }}
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className="max-w-full truncate px-[0.4cqw] text-center font-key font-bold leading-none"
                    style={{ fontSize: `${fontSize}cqw`, color: colors.text }}
                  >
                    {text || '·'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-muted">
        <span className="rounded-full bg-white px-2.5 py-1 shadow-soft">
          {keys.length} phím
        </span>
        <span className="rounded-full bg-white px-2.5 py-1 shadow-soft">{colors.name}</span>
        <span className="rounded-full bg-white px-2.5 py-1 shadow-soft">
          Switch {switchType === 'clicky' ? 'Clicky' : 'Smooth'}
        </span>
      </div>
    </div>
  );
}
