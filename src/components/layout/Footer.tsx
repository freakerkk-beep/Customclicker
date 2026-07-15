import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { SITE } from '../../config/site';
import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <Logo height={44} />
            <p className="mt-3 text-sm text-ink-muted">
              {SITE.tagline}. Mỗi chiếc clicker được lắp và kiểm tra bằng tay trước khi gửi đi.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <p className="font-display text-base font-semibold">Liên kết</p>
            <Link to="/products/custom-clicker" className="text-ink-muted hover:text-primary">
              Tự thiết kế clicker
            </Link>
            <Link to="/order-tracking" className="text-ink-muted hover:text-primary">
              Tra cứu đơn hàng
            </Link>
            <a
              href={SITE.zaloUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 text-ink-muted hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Nhắn Zalo cho shop
            </a>
          </div>
        </div>

        <p className="mt-8 border-t border-line pt-6 text-xs text-ink-muted">
          © {new Date().getFullYear()} {SITE.name}. Sản phẩm custom làm theo yêu cầu.
        </p>
      </div>
    </footer>
  );
}
