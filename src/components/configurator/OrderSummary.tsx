import { Minus, Pencil, Plus } from 'lucide-react';
import type { ClickerCustomData } from '../../../shared/orderSchema';
import type { ColorPalette, ProductConfig } from '../../types/product';
import { formatVnd } from '../../utils/currency';
import Card, { CardTitle } from '../ui/Card';

interface OrderSummaryProps {
  product: ProductConfig;
  customData: ClickerCustomData;
  palette: ColorPalette | undefined;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  onQuantityChange: (quantity: number) => void;
  onEditStep: (step: number) => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-sm text-ink-muted">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

export default function OrderSummary({
  product,
  customData,
  palette,
  quantity,
  unitPrice,
  subtotal,
  onQuantityChange,
  onEditStep,
}: OrderSummaryProps) {
  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <CardTitle hint="Kiểm tra kỹ trước khi đặt — nội dung đã in không sửa được.">
          Tóm tắt đơn hàng
        </CardTitle>
      </div>

      <dl className="divide-y divide-line">
        <Row label="Sản phẩm" value={product.name} />
        <Row label="Số lượng phím" value={`${customData.characterCount} phím`} />
        <Row label="Bộ màu" value={palette?.name ?? customData.colorPaletteId} />
        <Row label="Switch" value={customData.switchType === 'clicky' ? 'Clicky' : 'Smooth'} />
      </dl>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Nội dung từng phím</p>
          <button
            type="button"
            // Bước 2 = "Nội dung phím" trong luồng 4 bước.
            onClick={() => onEditStep(2)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary-soft"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            Quay lại chỉnh sửa
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {customData.keys.map((key, index) => (
            <li
              key={index}
              className="flex items-center gap-2 rounded-lg bg-cream px-2.5 py-1.5 text-xs"
            >
              <span className="text-ink-muted">Phím {index + 1}:</span>
              <span className="truncate font-medium">
                {key.type === 'text' ? key.value : product.icons.find((i) => i.id === key.iconId)?.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Số lượng sản phẩm */}
      <div className="mt-5 flex items-center justify-between rounded-xl bg-cream px-4 py-3">
        <span className="text-sm font-medium">Số lượng</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Giảm số lượng"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-primary hover:bg-primary-soft disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="w-6 text-center font-semibold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            disabled={quantity >= 20}
            aria-label="Tăng số lượng"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-primary hover:bg-primary-soft disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <dl className="mt-4 space-y-1 border-t border-line pt-4">
        <Row label="Đơn giá" value={formatVnd(unitPrice)} />
        <Row label={`Tạm tính (${quantity} sản phẩm)`} value={formatVnd(subtotal)} />
        <Row label="Phí vận chuyển" value="Shop sẽ xác nhận sau" />
        <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
          <dt className="font-medium">Tổng tiền sản phẩm</dt>
          <dd className="font-display text-xl font-bold text-primary">{formatVnd(subtotal)}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-ink-muted">
        Phí ship chưa gồm trong tổng trên. Shop báo phí cụ thể khi gọi xác nhận đơn.
      </p>
    </Card>
  );
}
