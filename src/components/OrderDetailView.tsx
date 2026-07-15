import { Check, Clock, XCircle } from 'lucide-react';
import {
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '../../shared/constants';
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

function StatusBadge({ status }: { status: OrderStatus }) {
  const isCancelled = status === 'cancelled';
  const isDone = status === 'completed';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        isCancelled
          ? 'bg-red-100 text-red-700'
          : isDone
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-primary-soft text-primary',
      ].join(' ')}
    >
      {isCancelled ? (
        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
      ) : isDone ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

/** Timeline theo luồng chuẩn, đánh dấu các bước đã qua. */
function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">{ORDER_STATUS_LABELS.cancelled}</p>
        <p className="mt-1 text-xs text-red-700">{ORDER_STATUS_DESCRIPTIONS.cancelled}</p>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <ol className="relative space-y-4 pl-6">
      <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-line" aria-hidden="true" />
      {ORDER_STATUS_FLOW.map((flowStatus, index) => {
        const done = currentIndex >= 0 && index <= currentIndex;
        const active = index === currentIndex;

        return (
          <li key={flowStatus} className="relative">
            <span
              className={[
                'absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2',
                done ? 'border-primary bg-primary' : 'border-line bg-white',
              ].join(' ')}
              aria-hidden="true"
            >
              {done ? <Check className="h-2.5 w-2.5 text-white" /> : null}
            </span>
            <p className={`text-sm ${active ? 'font-semibold text-primary' : done ? 'text-ink' : 'text-ink-muted'}`}>
              {ORDER_STATUS_LABELS[flowStatus]}
            </p>
            {active ? (
              <p className="mt-0.5 text-xs text-ink-muted">{ORDER_STATUS_DESCRIPTIONS[flowStatus]}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderDetailView({ order }: { order: OrderView }) {
  const item = order.items[0];

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-ink-muted">Mã đơn</p>
            <p className="font-display text-xl font-bold tracking-wide text-primary">
              {order.orderCode}
            </p>
            <p className="mt-1 text-xs text-ink-muted">Đặt lúc {formatDateTime(order.createdAt)}</p>
          </div>
          <StatusBadge status={order.status} />
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
              <dd className="font-display text-lg font-bold text-primary">{formatVnd(order.total)}</dd>
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
              <li key={index} className="flex items-center gap-2 rounded-lg bg-cream px-2.5 py-1.5 text-xs">
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
        <CardTitle>Tình trạng đơn</CardTitle>
        <StatusTimeline status={order.status} />
      </Card>

      <Card>
        <CardTitle>Địa chỉ nhận hàng</CardTitle>
        <p className="text-sm font-medium">{order.customerName}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {[order.addressDetail, order.ward, order.district, order.province].filter(Boolean).join(', ')}
        </p>
      </Card>
    </div>
  );
}
