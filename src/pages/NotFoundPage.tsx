import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <Logo height={64} />
      <h1 className="mt-6 font-display text-2xl font-bold">Không tìm thấy trang này</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Có thể đường dẫn đã cũ hoặc bị gõ nhầm. Bạn quay về trang chủ để bắt đầu lại nhé.
      </p>
      <Link to="/" className="mt-6">
        <Button>Về trang chủ</Button>
      </Link>
    </div>
  );
}
