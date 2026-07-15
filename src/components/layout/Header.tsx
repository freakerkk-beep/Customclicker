import { Link, NavLink } from 'react-router-dom';
import { PackageSearch } from 'lucide-react';
import Logo from '../ui/Logo';

const NAV_LINK_BASE =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-soft/60';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 rounded-lg" aria-label="Raccoonie — về trang chủ">
          <Logo height={40} />
        </Link>

        <nav className="flex items-center gap-1" aria-label="Điều hướng chính">
          <NavLink
            to="/products/custom-clicker"
            className={({ isActive }) =>
              `${NAV_LINK_BASE} ${isActive ? 'bg-primary-soft text-primary' : 'text-ink'}`
            }
          >
            Tự thiết kế
          </NavLink>
          <NavLink
            to="/order-tracking"
            className={({ isActive }) =>
              `${NAV_LINK_BASE} flex items-center gap-1.5 ${isActive ? 'bg-primary-soft text-primary' : 'text-ink'}`
            }
          >
            <PackageSearch className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tra cứu đơn</span>
            <span className="sm:hidden">Tra đơn</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
