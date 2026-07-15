import { Minus, Plus } from 'lucide-react';
import { buildPriceTable } from '../../utils/pricing';
import { formatVnd } from '../../utils/currency';
import type { ProductConfig } from '../../types/product';
import Card, { CardTitle } from '../ui/Card';

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
  const priceTable = buildPriceTable(product.pricing);

  const atMin = value <= minCharacters;
  const atMax = value >= maxCharacters;

  return (
    <Card>
      <CardTitle hint={`Chọn từ ${minCharacters} đến ${maxCharacters} phím. Giá đổi theo số phím.`}>
        Số lượng phím
      </CardTitle>

      <div className="flex items-center justify-center gap-5 rounded-xl bg-cream py-5">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={atMin}
          aria-label="Bớt một phím"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-[5rem] text-center">
          <p className="font-display text-4xl font-bold text-primary" aria-live="polite">
            {value}
          </p>
          <p className="text-xs text-ink-muted">phím</p>
        </div>

        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={atMax}
          aria-label="Thêm một phím"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {atMin ? (
        <p className="mt-2 text-center text-xs text-ink-muted">
          Khay tối thiểu {minCharacters} phím.
        </p>
      ) : null}
      {atMax ? (
        <p className="mt-2 text-center text-xs text-ink-muted">
          Tối đa {maxCharacters} phím. Cần nhiều hơn? Nhắn Zalo để shop báo giá riêng.
        </p>
      ) : null}

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium">Bảng giá theo số phím</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {priceTable.map((row) => {
            const selected = row.characterCount === value;
            return (
              <button
                key={row.characterCount}
                type="button"
                onClick={() => onChange(row.characterCount)}
                aria-pressed={selected}
                className={[
                  'rounded-xl border px-3 py-2 text-left transition-colors',
                  selected
                    ? 'border-primary bg-primary-soft'
                    : 'border-line bg-white hover:border-primary/40 hover:bg-primary-soft/40',
                ].join(' ')}
              >
                <span className="block text-xs text-ink-muted">{row.characterCount} phím</span>
                <span
                  className={`block text-sm font-semibold ${selected ? 'text-primary' : 'text-ink'}`}
                >
                  {formatVnd(row.price)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Từ phím thứ 8 trở đi, mỗi phím thêm cộng {formatVnd(product.pricing.extraPricePerCharacter)}.
        </p>
      </div>
    </Card>
  );
}
