import { useState } from 'react';
import { SITE } from '../../config/site';

interface LogoProps {
  /** Chiều cao hiển thị (px). Tỉ lệ ảnh luôn được giữ nguyên, không kéo méo. */
  height?: number;
  className?: string;
}

/**
 * Logo Raccoonie.
 *
 * Ảnh gốc đặt tại `public/assets/logo-raccoonie.png` (xem README).
 * Dùng đúng file logo được cung cấp — không vẽ lại, không đổi nội dung.
 * `w-auto` + `object-contain` đảm bảo logo không bị bóp méo ở mọi kích thước.
 *
 * Nếu file logo chưa được đặt vào thư mục, component hiện tạm tên thương hiệu
 * để trang không bị vỡ (thay vì hiện icon ảnh lỗi).
 */
export default function Logo({ height = 40, className = '' }: LogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`font-display font-bold text-primary ${className}`}
        style={{ fontSize: height * 0.55 }}
      >
        {SITE.name}
      </span>
    );
  }

  return (
    <img
      src={SITE.logoSrc}
      alt="Logo Raccoonie"
      style={{ height }}
      className={`w-auto object-contain ${className}`}
      onError={() => setFailed(true)}
      decoding="async"
    />
  );
}
