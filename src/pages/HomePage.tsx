import { Link } from 'react-router-dom';
import { ArrowRight, PackageSearch, Palette, Sparkles } from 'lucide-react';
import { getAllProducts } from '../products/productRegistry';
import { calculateProductPrice } from '../utils/pricing';
import { formatVnd } from '../utils/currency';
import Button from '../components/ui/Button';
import ClickerTray from '../components/configurator/ClickerTray';
import type { KeyItem } from '../../shared/orderSchema';

/** Khay mẫu ở hero — dựng bằng chính component preview thật, không phải ảnh. */
const HERO_KEYS: KeyItem[] = [
  { type: 'text' as const, value: 'R' },
  { type: 'text' as const, value: 'A' },
  { type: 'icon' as const, iconId: 'heart' },
  { type: 'text' as const, value: 'C' },
  { type: 'icon' as const, iconId: 'star' },
];

export default function HomePage() {
  const products = getAllProducts();
  const featured = products[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Làm thủ công theo yêu cầu
          </span>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">
            Clicker của bạn,
            <br />
            <span className="text-primary">đúng chữ bạn muốn.</span>
          </h1>

          <p className="mt-4 max-w-md text-ink-muted">
            Chọn số phím, bộ màu và nội dung từng phím. Xem trước ngay trên màn hình, chốt xong là
            Raccoonie bắt tay vào làm.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {featured ? (
              <Link to={`/products/${featured.slug}`}>
                <Button size="lg">
                  Bắt đầu thiết kế
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            ) : null}
            <Link to="/order-tracking">
              <Button size="lg" variant="secondary" icon={<PackageSearch className="h-4 w-4" />}>
                Tra cứu đơn hàng
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-xl2 border border-line bg-white p-6 shadow-soft sm:p-8">
          <ClickerTray keys={HERO_KEYS} palette={featured?.palettes[0]} switchType="clicky" />
        </div>
      </section>

      {/* Danh sách sản phẩm — hiện có 1, cấu trúc sẵn sàng cho nhiều sản phẩm */}
      <section className="mt-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Sản phẩm</h2>
          <p className="text-sm text-ink-muted">{products.length} sản phẩm</p>
        </div>

        {products.length === 0 ? (
          <div className="card-surface p-10 text-center">
            <Palette className="mx-auto h-8 w-8 text-ink-muted" aria-hidden="true" />
            <p className="mt-3 font-medium">Chưa có sản phẩm nào đang mở bán</p>
            <p className="mt-1 text-sm text-ink-muted">
              Bạn quay lại sau nhé, Raccoonie đang chuẩn bị hàng mới.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="card-surface group overflow-hidden p-0 transition-shadow hover:shadow-lift"
              >
                <div className="aspect-[4/3] overflow-hidden bg-cream">
                  <img
                    src={product.thumbnailUrl}
                    alt={product.images[0]?.alt ?? product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold">{product.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
                    {product.shortDescription}
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="text-ink-muted">Từ </span>
                    <span className="font-display text-lg font-bold text-primary">
                      {formatVnd(
                        calculateProductPrice(product.pricing.minCharacters, product.pricing),
                      )}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
