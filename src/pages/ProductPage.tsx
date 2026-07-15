import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductBySlug } from '../products/productRegistry';
import ProductConfigurator from '../components/configurator/ProductConfigurator';
import Button from '../components/ui/Button';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;

  useEffect(() => {
    if (product) document.title = `Tự thiết kế ${product.name} | Raccoonie`;
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

  // Trang sản phẩm đi thẳng vào khu vực custom để khách không phải đọc lại
  // phần giới thiệu dài đã thấy ở trang chủ.
  return (
    <main className="min-h-[calc(100vh-4rem)] py-7 sm:py-10">
      <ProductConfigurator product={product} />
    </main>
  );
}
