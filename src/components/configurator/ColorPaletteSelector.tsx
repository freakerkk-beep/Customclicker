import { Check } from 'lucide-react';
import type { ColorPalette, ProductConfig } from '../../types/product';
import Card, { CardTitle } from '../ui/Card';

interface ColorPaletteSelectorProps {
  product: ProductConfig;
  value: string;
  onChange: (paletteId: string) => void;
}

/** Ba chấm màu: khay – phím – chữ. */
function PaletteDots({ palette }: { palette: ColorPalette }) {
  const dots: Array<{ color: string; label: string }> = [
    { color: palette.tray, label: 'Màu khay' },
    { color: palette.key, label: 'Màu phím' },
    { color: palette.text, label: 'Màu chữ' },
  ];

  return (
    <div className="flex -space-x-1.5">
      {dots.map((dot) => (
        <span
          key={dot.label}
          title={`${dot.label}: ${dot.color}`}
          className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: dot.color }}
        />
      ))}
    </div>
  );
}

export default function ColorPaletteSelector({ product, value, onChange }: ColorPaletteSelectorProps) {
  return (
    <Card>
      <CardTitle hint="Chọn bộ màu — đế, phím và màu chữ đi cố định cùng nhau.">
        {`Bộ màu (${product.palettes.length} mẫu)`}
      </CardTitle>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Bộ màu sản phẩm"
      >
        {product.palettes.map((palette, index) => {
          const selected = palette.id === value;
          return (
            <button
              key={palette.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(palette.id)}
              className={[
                'relative rounded-xl border p-3 text-left transition-all',
                selected
                  ? 'border-primary bg-primary-soft/60 shadow-soft'
                  : 'border-line bg-white hover:border-primary/40',
              ].join(' ')}
            >
              {selected ? (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
              ) : null}

              <div
                className="mb-2.5 flex h-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: palette.tray }}
              >
                <span
                  className="flex h-7 w-9 items-center justify-center rounded-md font-key text-[10px] font-bold"
                  style={{ backgroundColor: palette.key, color: palette.text }}
                >
                  Aa
                </span>
              </div>

              <p className="text-sm font-medium">
                {index + 1}. {palette.name}
              </p>
              {/* Mã vật liệu đế/phím/chữ — giống web cũ, để đối chiếu với xưởng. */}
              <p className="font-mono text-[10px] text-ink-muted">{palette.code}</p>
              <div className="mt-1.5">
                <PaletteDots palette={palette} />
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg bg-cream px-3 py-2 text-xs text-ink-muted">
        Màu thực tế có thể lệch nhẹ so với màu hiển thị trên màn hình của bạn.
      </p>
    </Card>
  );
}
