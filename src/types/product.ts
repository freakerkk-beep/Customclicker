import type { PricingConfig } from '../../shared/pricing';

/** ID icon được phép in lên phím. Lưu bằng ID, không bao giờ lưu HTML. */
export type IconId =
  | 'heart'
  | 'star'
  | 'smile'
  | 'flower'
  | 'music'
  | 'paw'
  | 'crown'
  | 'bolt'
  | 'sun'
  | 'moon';

export type SwitchType = 'clicky' | 'smooth';

export interface ColorPalette {
  id: string;
  name: string;
  /** Màu khay. */
  tray: string;
  /** Màu phím. */
  key: string;
  /** Màu chữ/icon trên phím. */
  text: string;
  /**
   * Mã vật liệu theo thứ tự đế/phím/chữ, ví dụ "M05/M06/M05".
   * Hiện dưới tên bộ màu (giống web cũ) để xưởng và khách nói cùng một ngôn ngữ
   * khi trao đổi đơn.
   */
  code: string;
}

export interface IconOption {
  id: IconId;
  label: string;
}

export interface SwitchOption {
  id: SwitchType;
  name: string;
  description: string;
  /** Đặc điểm âm thanh, hiển thị dưới dạng chip. */
  soundTraits: string[];
  /** Đường dẫn file nghe thử. File có thể chưa tồn tại — web vẫn chạy bình thường. */
  sampleAudioUrl: string;
}

export interface ProductImage {
  src: string;
  alt: string;
}

/** Cấu hình Pancake theo từng sản phẩm (ghi đè biến môi trường nếu cần). */
export interface ProductPancakeConfig {
  productIdEnvKey?: string;
  variantIdEnvKey?: string;
}

/**
 * Toàn bộ mô tả một sản phẩm clicker.
 * Thêm sản phẩm mới = thêm 1 file như thế này + đăng ký ở productRegistry.
 * Không cần sửa component nào.
 */
export interface ProductConfig {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  /** Kiểu configurator dùng để render. Hiện chỉ có 'clicker'. */
  templateType: 'clicker';
  images: ProductImage[];
  thumbnailUrl: string;
  pricing: PricingConfig;
  palettes: ColorPalette[];
  icons: IconOption[];
  switches: SwitchOption[];
  /** Thời gian sản xuất dự kiến, hiển thị ở phần giới thiệu. */
  productionTime: string;
  benefits: Array<{ title: string; description: string }>;
  notes: string[];
  pancake?: ProductPancakeConfig;
  active: boolean;
}
