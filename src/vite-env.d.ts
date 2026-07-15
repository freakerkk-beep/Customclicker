/// <reference types="vite/client" />

/**
 * Khai báo kiểu cho các biến môi trường VITE_* mà dự án dùng.
 * Nhờ file này, khi gõ `import.meta.env.` trong VS Code bạn sẽ được gợi ý
 * đúng tên biến, và gõ sai tên sẽ bị báo lỗi ngay khi build.
 *
 * LƯU Ý: chỉ khai báo biến CÔNG KHAI ở đây. Service role key của Supabase
 * và API key của Pancake không bao giờ được đặt tên VITE_ (xem .env.example).
 */
interface ImportMetaEnv {
  /** URL website sau khi deploy, không có dấu / ở cuối. */
  readonly VITE_SITE_URL?: string;
  /** Link Zalo của shop. */
  readonly VITE_ZALO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
