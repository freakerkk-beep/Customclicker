import { Check } from 'lucide-react';
import type { ColorPalette, ProductConfig } from '../../types/product';

interface ColorPaletteSelectorProps {
  product: ProductConfig;
  value: string;
  onChange: (paletteId: string) => void;
}

function withAlpha(hex: string, alpha: string): string {
  return /^#[0-9a-f]{6}$/i.test(hex) ? `${hex}${alpha}` : '#FBF5FC';
}

function MiniPalette({ palette }: { palette: ColorPalette }) {
  return (
    <div
      className="mx-auto mb-2 flex h-8 w-fit items-center gap-1 rounded-lg px-2"
      style={{ backgroundColor: palette.tray }}
      aria-hidden="true"
    >
      {[0, 1, 2].map((item) => (
        <span
          key={item}
          className="h-4 w-4 rounded-[4px] shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: palette.key }}
        />
      ))}
    </div>
  );
}

export default function ColorPaletteSelector({
  product,
  value,
  onChange,
}: ColorPaletteSelectorProps) {
  return (
    <section aria-labelledby="palette-title">
      <div className="mb-2">
        <h3
          id="palette-title"
          className="font-display text-sm font-bold uppercase tracking-wide text-accent"
        >
          Bộ màu ({product.palettes.length} mẫu)
        </h3>
      </div>

      <div
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
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
                'relative min-h-[92px] rounded-xl border px-2 py-2.5 text-center transition-all',
                selected
                  ? 'border-primary shadow-[0_0_0_3px_rgba(237,90,138,0.2)]'
                  : 'border-line hover:border-primary/45 hover:-translate-y-0.5',
              ].join(' ')}
              style={{ backgroundColor: withAlpha(palette.tray, selected ? '22' : '12') }}
            >
              {selected ? (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-2.5 w-2.5" aria-hidden="true" />
                </span>
              ) : null}

              <MiniPalette palette={palette} />
              <p
                className={`text-[11px] font-bold leading-tight ${selected ? 'text-primary' : 'text-ink'}`}
              >
                {index + 1}. {palette.name}
              </p>
              <p className="mt-0.5 font-mono text-[9px] leading-tight text-ink-muted/75">
                {palette.code}
              </p>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-ink-muted">
        Màu thực tế có thể lệch nhẹ so với màu trên màn hình.
      </p>
    </section>
  );
}
