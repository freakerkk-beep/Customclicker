import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { AlertTriangle, Check, Copy, Home, MessageCircle, Receipt } from 'lucide-react';
import { SITE } from '../config/site';
import type { CreateOrderSuccess } from '../types/order';
import { formatVnd } from '../utils/currency';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { useToast } from '../components/ui/Toast';

interface SuccessState {
  order?: CreateOrderSuccess;
  productName?: string;
}

/**
 * Trang này CHỈ hiện sau khi backend đã trả về mã đơn.
 * Dữ liệu đơn được truyền qua router state khi đặt hàng xong.
 * Nếu khách mở thẳng link (F5 / bookmark), không bịa dữ liệu —
 * chỉ hiện mã đơn và mời sang trang chi tiết để tra cứu.
 */
export default function OrderSuccessPage() {
  const { orderCode = '' } = useParams<{ orderCode: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as SuccessState;
  const order = state.order;

  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = `Đơn ${orderCode} | Raccoonie`;
  }, [orderCode]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(orderCode);
      setCopied(true);
      showToast('Đã sao chép mã đơn.', 'success');
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Trình duyệt không cho sao chép. Bạn chép tay giúp mình nhé.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="card-surface p-6 text-center sm:p-8">
        <Logo height={56} className="mx-auto" />

        <span className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="h-7 w-7" aria-hidden="true" />
        </span>

        <h1 className="mt-4 font-display text-2xl font-bold">Raccoonie đã nhận được đơn hàng!</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Shop sẽ gọi hoặc nhắn tin xác nhận đơn và báo phí vận chuyển trong thời gian sớm nhất.
        </p>

        {/* Mã đơn */}
        <div className="mt-6 rounded-xl border border-line bg-cream p-4">
          <p className="text-xs text-ink-muted">Mã đơn hàng của bạn</p>
          <p className="mt-1 font-display text-2xl font-bold tracking-wide text-primary">
            {orderCode}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={copyCode}
            icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copied ? 'Đã sao chép' : 'Sao chép mã đơn'}
          </Button>
          <p className="mt-3 text-xs text-ink-muted">
            Giữ lại mã này để tra cứu đơn. Cần thêm số điện thoại đã đặt để xem chi tiết.
          </p>
        </div>

        {/* Tóm tắt — chỉ hiện khi thực sự có dữ liệu từ backend */}
        {order ? (
          <dl className="mt-5 space-y-2 rounded-xl bg-white p-4 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Sản phẩm</dt>
              <dd className="text-right font-medium">{state.productName ?? 'Custom Clicker'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Số lượng</dt>
              <dd className="font-medium">{order.quantity}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Đơn giá</dt>
              <dd className="font-medium">{formatVnd(order.unitPrice)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Phí vận chuyển</dt>
              <dd className="font-medium">Shop sẽ xác nhận sau</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-2">
              <dt className="font-medium">Tổng tiền sản phẩm</dt>
              <dd className="font-display text-lg font-bold text-primary">
                {formatVnd(order.total)}
              </dd>
            </div>
          </dl>
        ) : null}

        {/* Trạng thái đồng bộ Pancake — nói thật với khách */}
        {order?.pancakePending ? (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-left">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-xs text-amber-900">
              Đơn của bạn <strong>đã được ghi nhận</strong> và không bị mất. Hệ thống đang chờ đồng
              bộ sang phần mềm quản lý của shop, nên thời gian xác nhận có thể lâu hơn bình thường
              một chút.
            </p>
          </div>
        ) : order ? (
          <p className="mt-5 text-xs text-ink-muted">
            Đơn đã được chuyển sang hệ thống xử lý của shop.
          </p>
        ) : null}

        {/* Hành động */}
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Link to={`/order/${orderCode}`}>
            <Button variant="secondary" fullWidth icon={<Receipt className="h-4 w-4" />}>
              Xem chi tiết đơn
            </Button>
          </Link>
          <a href={SITE.zaloUrl} target="_blank" rel="noreferrer noopener">
            <Button variant="secondary" fullWidth icon={<MessageCircle className="h-4 w-4" />}>
              Liên hệ Zalo
            </Button>
          </a>
        </div>

        <Link to="/" className="mt-2 block">
          <Button variant="ghost" fullWidth icon={<Home className="h-4 w-4" />}>
            Trở về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
