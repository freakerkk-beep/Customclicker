import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, Gift, Info, Palette, PenLine } from 'lucide-react';
import { getProductBySlug } from '../products/productRegistry';
import { calculateProductPrice } from '../utils/pricing';
import { formatVnd } from '../utils/currency';
import ProductConfigurator from '../components/configurator/ProductConfigurator';
import Button from '../components/ui/Button';

const BENEFIT_ICONS = [PenLine, Palette, Gift];

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  // ProductPage chỉ đọc slug từ URL rồi lấy cấu hình từ danh bạ —
  // không hề biết "custom-clicker" là gì. Thêm sản phẩm mới không cần sửa file này.
  const product = slug ? getProductBySlug(slug) : undefined;

  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (product) document.title = `${product.name} | Raccoonie`;
    return () => {
      document.title = 'Custom Clicker Raccoonie | Tự thiết kế clicker của riêng bạn';
    };
  }, [product]);

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Không tìm thấy sản phẩm</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Sản phẩm “{slug}” không tồn tại hoặc đã ngừng bán.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Xem sản phẩm khác</Button>
        </Link>
      </div>
    );
  }

  const startingPrice = calculateProductPrice(product.pricing.minCharacters, product.pricing);

  return (
    <div className="py-8 sm:py-12">
      {/* ---------- Giới thiệu sản phẩm ---------- */}
      <section className="mx-auto mb-10 max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="aspect-[4/3] overflow-hidden rounded-xl2 border border-line bg-white">
              <img
                src={product.images[activeImage]?.src ?? product.thumbnailUrl}
                alt={product.images[activeImage]?.alt ?? product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 ? (
              <div className="mt-3 flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Xem ảnh ${index + 1}`}
                    aria-pressed={index === activeImage}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                      index === activeImage ? 'border-primary' : 'border-line hover:border-primary/40'
                    }`}
                  >
                    <img src={image.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
              Sản phẩm custom theo yêu cầu
            </span>

            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-ink-muted">{product.shortDescription}</p>

            <p className="mt-5">
              <span className="text-sm text-ink-muted">Giá từ </span>
              <span className="font-display text-3xl font-bold text-primary">
                {formatVnd(startingPrice)}
              </span>
              <span className="ml-1 text-sm text-ink-muted">
                / {product.pricing.minCharacters} ký tự
              </span>
            </p>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-sm shadow-soft">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="font-medium">Thời gian sản xuất dự kiến:</span>{' '}
                <span className="text-ink-muted">{product.productionTime}</span>
              </span>
            </div>

            <p className="mt-4 text-sm text-ink-muted">{product.longDescription}</p>

            <ul className="mt-5 space-y-2">
              {product.notes.map((note) => (
                <li key={note} className="flex items-start gap-2 text-xs text-ink-muted">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden="true" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Ba lợi ích ---------- */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {product.benefits.map((benefit, index) => {
            const Icon = BENEFIT_ICONS[index] ?? PenLine;
            return (
              <div key={benefit.title} className="card-surface p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-base font-semibold">{benefit.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Khu vực custom ---------- */}
      <ProductConfigurator product={product} />
    </div>
  );
}
