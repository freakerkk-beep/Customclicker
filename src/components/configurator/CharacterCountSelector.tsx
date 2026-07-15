import { Minus, Plus } from 'lucide-react';
import type { ProductConfig } from '../../types/product';

interface CharacterCountSelectorProps {
  product: ProductConfig;
  value: number;
  onChange: (count: number) => void;
}

export default function CharacterCountSelector({
  product,
  value,
  onChange,
}: CharacterCountSelectorProps) {
  const { minCharacters, maxCharacters } = product.pricing;
  const atMin = value <= minCharacters;
  const atMax = value >= maxCharacters;

  return (
    <section aria-labelledby="character-count-title">
      <div className="mb-2">
        <h3
          id="character-count-title"
          className="font-display text-sm font-bold uppercase tracking-wide text-accent"
        >
          Số lượng phím
        </h3>
        <p className="mt-1 text-xs text-ink-muted">
          Chọn từ {minCharacters} đến {maxCharacters} phím.
        </p>
      </div>

      <div className="inline-flex h-12 items-stretch overflow-hidden rounded-full border border-primary/30 bg-white shadow-soft">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={atMin}
          aria-label="Bớt một phím"
          className="flex w-12 items-center justify-center text-primary transition-colors hover:bg-primary-soft/60 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex min-w-[72px] items-center justify-center border-x border-primary/20 px-4">
          <span className="font-display text-xl font-bold text-ink" aria-live="polite">
            {value}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={atMax}
          aria-label="Thêm một phím"
          className="flex w-12 items-center justify-center text-primary transition-colors hover:bg-primary-soft/60 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {atMax ? (
        <p className="mt-2 text-xs text-ink-muted">
          Cần nhiều hơn {maxCharacters} phím? Nhắn Zalo để shop báo giá riêng.
        </p>
      ) : null}
    </section>
  );
}
