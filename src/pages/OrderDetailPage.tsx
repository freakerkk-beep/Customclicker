import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { AlertCircle, Lock } from 'lucide-react';
import { ApiError, getOrder } from '../services/orderApi';
import { filterPhoneInput, isValidVnPhone } from '../utils/validation';
import type { OrderView } from '../types/order';
import Button from '../components/ui/Button';
import Card, { CardTitle } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import OrderDetailView from '../components/OrderDetailView';

/**
 * Chi tiết đơn theo mã.
 *
 * Chỉ có mã đơn thì CHƯA đủ để xem — vẫn cần số điện thoại đặt hàng.
 * Nhờ vậy ai nhặt được link cũng không xem được thông tin của khách.
 */
export default function OrderDetailPage() {
  const { orderCode = '' } = useParams<{ orderCode: string }>();
  const location = useLocation();
  const statePhone = (location.state as { phone?: string } | null)?.phone ?? '';

  const [phone, setPhone] = useState(statePhone);
  const [order, setOrder] = useState<OrderView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = `Đơn ${orderCode} | Raccoonie`;
  }, [orderCode]);

  const fetchOrder = useCallback(
    async (phoneValue: string) => {
      setLoading(true);
      setError('');
      try {
        setOrder(await getOrder(orderCode, phoneValue));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Không tải được đơn hàng.');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    },
    [orderCode],
  );

  // Đến từ trang tra cứu / đặt hàng thì đã có số điện thoại -> tải luôn.
  useEffect(() => {
    if (statePhone) void fetchOrder(statePhone);
  }, [statePhone, fetchOrder]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValidVnPhone(phone)) {
      setError('Số điện thoại không hợp lệ.');
      return;
    }
    void fetchOrder(phone);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-baseline justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Chi tiết đơn hàng</h1>
          <p className="mt-1 font-mono text-sm text-ink-muted">{orderCode}</p>
        </div>
        <Link to="/order-tracking" className="text-sm text-primary hover:underline">
          Tra đơn khác
        </Link>
      </div>

      {loading ? <Spinner label="Đang tải đơn hàng…" /> : null}

      {!loading && !order ? (
        <Card>
          <CardTitle hint="Cần số điện thoại đã dùng khi đặt để mở đơn này.">
            Xác minh chủ đơn
          </CardTitle>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="verifyPhone" className="field-label">
              Số điện thoại đặt hàng <span className="text-red-500">*</span>
            </label>
            <input
              id="verifyPhone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(filterPhoneInput(event.target.value))}
              placeholder="0912345678"
              autoComplete="tel"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'verifyPhone-error' : undefined}
              className={`field-input ${error ? 'field-input-error' : ''}`}
            />
            {error ? (
              <p id="verifyPhone-error" className="field-error">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            ) : null}

            <Button type="submit" fullWidth className="mt-4" icon={<Lock className="h-4 w-4" />}>
              Xem đơn hàng
            </Button>
          </form>
        </Card>
      ) : null}

      {order ? <OrderDetailView order={order} /> : null}
    </div>
  );
}
