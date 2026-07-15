/**
 * Cấu hình chung của website.
 * Đổi link Zalo / URL site bằng biến môi trường VITE_* (xem .env.example),
 * không cần sửa code.
 */
export const SITE = {
  name: 'Raccoonie',
  tagline: 'Custom Clicker làm thủ công theo yêu cầu',
  url: import.meta.env.VITE_SITE_URL ?? 'https://raccoonie-custom-clicker.netlify.app',
  zaloUrl: import.meta.env.VITE_ZALO_URL ?? 'https://zalo.me/',
  logoSrc: '/assets/logo-raccoonie.png',
} as const;

/** Link xem chi tiết đơn, dùng cả ở frontend lẫn trong ghi chú Pancake. */
export function buildOrderDetailUrl(orderCode: string): string {
  return `${SITE.url.replace(/\/$/, '')}/order/${orderCode}`;
}
