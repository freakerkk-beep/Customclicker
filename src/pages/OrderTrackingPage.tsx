import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Search } from 'lucide-react';
import { ApiError, getOrder } from '../services/orderApi';
import { isValidVnPhone } from '../utils/validation';
import { filterPhoneInput } from '../utils/validation';
import Button from '../components/ui/Button';
import Card, { CardTitle } from '../components/ui/Card';
import OrderDetailView from '../components/OrderDetailView';
import type { OrderView } from '../types/order';

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderView | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const next: Record<string, string> = {};
    if (!/^RAC-\d{6}-[A-Z0-9]{4}$/i.test(orderCode.trim())) {
      next.orderCode = 'Mã đơn có dạng RAC-260715-A8F2.';
    }
    if (!isValidVnPhone(phone)) {
      next.phone = 'Số điện thoại không hợp lệ.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setOrder(null);
    try {
      const result = await getOrder(orderCode.trim().toUpperCase(), phone);
      setOrder(result);
      // Đưa mã lên URL để khách lưu lại link.
      navigate(`/order/${result.orderCode}`, { state: { phone } });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Không tra cứu được đơn. Vui lòng thử lại.';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Tra cứu đơn hàng</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Nhập mã đơn và số điện thoại đã dùng khi đặt. Cần cả hai để bảo vệ thông tin của bạn.
      </p>

      <Card className="mt-6">
        <CardTitle>Thông tin tra cứu</CardTitle>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4">
            <div>
              <label htmlFor="orderCode" className="field-label">
                Mã đơn hàng <span className="text-red-500">*</span>
              </label>
              <input
                id="orderCode"
                type="text"
                value={orderCode}
                onChange={(event) => setOrderCode(event.target.value.toUpperCase())}
                placeholder="RAC-260715-A8F2"
                autoComplete="off"
                aria-invalid={Boolean(errors.orderCode)}
                aria-describedby={errors.orderCode ? 'orderCode-error' : undefined}
                className={`field-input font-mono ${errors.orderCode ? 'field-input-error' : ''}`}
              />
              {errors.orderCode ? (
                <p id="orderCode-error" className="field-error">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {errors.orderCode}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="trackPhone" className="field-label">
                Số điện thoại đặt hàng <span className="text-red-500">*</span>
              </label>
              <input
                id="trackPhone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(filterPhoneInput(event.target.value))}
                placeholder="0912345678"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'trackPhone-error' : undefined}
                className={`field-input ${errors.phone ? 'field-input-error' : ''}`}
              />
              {errors.phone ? (
                <p id="trackPhone-error" className="field-error">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {errors.phone}
                </p>
              ) : null}
            </div>

            {errors.form ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.form}
              </p>
            ) : null}

            <Button type="submit" loading={loading} icon={<Search className="h-4 w-4" />} fullWidth>
              {loading ? 'Đang tra cứu…' : 'Tra cứu đơn'}
            </Button>
          </div>
        </form>
      </Card>

      {order ? (
        <div className="mt-6">
          <OrderDetailView order={order} />
        </div>
      ) : null}
    </div>
  );
}
