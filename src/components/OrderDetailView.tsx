import type { OrderView } from '../types/order';
import { formatVnd } from '../utils/currency';
import Card, { CardTitle } from './ui/Card';

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));
}

export default function OrderDetailView({ order }: { order: OrderView }) {
  const item = order.items[0];

  return (
    <div className="space-y-5">
      <Card>
        <div>
          <p className="text-xs text-ink-muted">Mã đơn</p>
          <p className="font-display text-xl font-bold tracking-wide text-primary">
            {order.orderCode}
          </p>
          <p className="mt-1 text-xs text-ink-muted">Đặt lúc {formatDateTime(order.createdAt)}</p>
        </div>

        {item ? (
          <dl className="mt-5 divide-y divide-line border-t border-line pt-2">
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-sm text-ink-muted">Sản phẩm</dt>
              <dd className="text-right text-sm font-medium">{item.productName}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-sm text-ink-muted">Số ký tự</dt>
              <dd className="text-sm font-medium">{item.customData.characterCount} ký tự</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-sm text-ink-muted">Số lượng</dt>
              <dd className="text-sm font-medium">{item.quantity}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-sm text-ink-muted">Phí vận chuyển</dt>
              <dd className="text-sm font-medium">
                {order.shippingFee === null ? 'Shop sẽ xác nhận sau' : formatVnd(order.shippingFee)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2">
              <dt className="text-sm font-medium">Tổng tiền</dt>
              <dd className="font-display text-lg font-bold text-primary">
                {formatVnd(order.total)}
              </dd>
            </div>
          </dl>
        ) : null}
      </Card>

      {item?.previewUrl ? (
        <Card>
          <CardTitle>Thiết kế của bạn</CardTitle>
          <img
            src={item.previewUrl}
            alt={`Ảnh xem trước thiết kế của đơn ${order.orderCode}`}
            className="w-full rounded-xl border border-line"
            loading="lazy"
          />
        </Card>
      ) : null}

      {item ? (
        <Card>
          <CardTitle>Nội dung từng phím</CardTitle>
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {item.customData.keys.map((key, index) => (
              <li
                key={index}
                className="flex items-center gap-2 rounded-lg bg-cream px-2.5 py-1.5 text-xs"
              >
                <span className="text-ink-muted">Phím {index + 1}:</span>
                <span className="truncate font-medium">
                  {key.type === 'text' ? key.value : key.iconId.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Địa chỉ nhận hàng</CardTitle>
        <p className="text-sm font-medium">{order.customerName}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {[order.addressDetail, order.ward, order.district, order.province]
            .filter(Boolean)
            .join(', ')}
        </p>
      </Card>
    </div>
  );
}
