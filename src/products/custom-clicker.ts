import { CLICKER_PRICING } from '../../shared/pricing';
import type { ProductConfig } from '../types/product';

/**
 * CẤU HÌNH SẢN PHẨM: Custom Clicker Raccoonie
 *
 * Đây là nơi duy nhất chứa dữ liệu của sản phẩm này.
 * Muốn đổi bảng màu / icon / ảnh / bảng giá thì sửa ở file này,
 * KHÔNG sửa component.
 *
 * Thêm sản phẩm mới: copy file này, đổi id + slug, rồi đăng ký
 * trong `productRegistry.ts`. Xem hướng dẫn ở README.
 */
export const customClickerProduct: ProductConfig = {
  id: 'custom-clicker',
  slug: 'custom-clicker',
  name: 'Custom Clicker Raccoonie',
  templateType: 'clicker',
  shortDescription:
    'Khay clicker bấm cho vui tay, in đúng chữ và icon bạn muốn. Mỗi chiếc được lắp và kiểm tra thủ công tại xưởng Raccoonie.',
  longDescription:
    'Custom Clicker là món đồ nhỏ để trên bàn làm việc: mỗi phím là một ký tự hoặc icon do bạn chọn, gõ vào nghe rất đã tay. Bạn chọn số phím, bộ màu, nội dung từng phím và kiểu âm thanh switch — Raccoonie làm theo đúng cấu hình đó.',

  images: [
    // Thay ảnh thật vào public/products/custom-clicker/ và sửa đường dẫn tại đây.
    { src: '/products/custom-clicker/clicker-1.svg', alt: 'Custom Clicker Raccoonie bộ màu Milk Tea' },
    { src: '/products/custom-clicker/clicker-2.svg', alt: 'Cận cảnh các phím của Custom Clicker' },
    { src: '/products/custom-clicker/clicker-3.svg', alt: 'Custom Clicker đặt trên bàn làm việc' },
  ],
  thumbnailUrl: '/products/custom-clicker/clicker-1.svg',

  pricing: CLICKER_PRICING,
  productionTime: '3 – 5 ngày làm việc kể từ khi chốt đơn',

  palettes: [
    { id: 'milk-tea', name: 'Milk Tea', tray: '#C9A227', key: '#EBD9C3', text: '#5F3B22' },
    { id: 'strawberry-cream', name: 'Strawberry Cream', tray: '#E8879B', key: '#FFE3E8', text: '#8C3149' },
    { id: 'baby-blue', name: 'Baby Blue', tray: '#7FB2D8', key: '#E2F1FB', text: '#2C5878' },
    { id: 'lavender', name: 'Lavender', tray: '#9B8AC4', key: '#EDE7FA', text: '#4B3A78' },
    { id: 'mint', name: 'Mint', tray: '#79C2A6', key: '#E1F6EE', text: '#255F49' },
    { id: 'lemon-cream', name: 'Lemon Cream', tray: '#E3C34D', key: '#FBF3D5', text: '#6B5312' },
    { id: 'chocolate', name: 'Chocolate', tray: '#6B4034', key: '#E9D6C9', text: '#3A2018' },
  ],

  icons: [
    { id: 'heart', label: 'Trái tim' },
    { id: 'star', label: 'Ngôi sao' },
    { id: 'smile', label: 'Mặt cười' },
    { id: 'flower', label: 'Hoa' },
    { id: 'music', label: 'Nốt nhạc' },
    { id: 'paw', label: 'Bàn chân' },
    { id: 'crown', label: 'Vương miện' },
    { id: 'bolt', label: 'Tia chớp' },
    { id: 'sun', label: 'Mặt trời' },
    { id: 'moon', label: 'Mặt trăng' },
  ],

  switches: [
    {
      id: 'clicky',
      name: 'Clicky',
      description: 'Tiếng “tách” rõ ràng, dứt khoát. Hợp với ai thích cảm giác bấm có phản hồi.',
      soundTraits: ['Tiếng tách rõ', 'Phản hồi dứt khoát', 'To vừa'],
      sampleAudioUrl: '/audio/clicky.mp3',
    },
    {
      id: 'smooth',
      name: 'Smooth',
      description: 'Bấm êm, tiếng trầm và nhẹ. Hợp với văn phòng hoặc lúc cần yên tĩnh.',
      soundTraits: ['Êm tay', 'Tiếng trầm', 'Nhẹ nhàng'],
      sampleAudioUrl: '/audio/smooth.mp3',
    },
  ],

  benefits: [
    {
      title: 'Custom nội dung riêng',
      description: 'Tên, ngày kỷ niệm, biệt danh hay icon — mỗi phím là một nội dung do bạn đặt.',
    },
    {
      title: 'Nhiều lựa chọn màu sắc',
      description: 'Bảy bộ màu phối sẵn, xem trước ngay trên màn hình trước khi chốt.',
    },
    {
      title: 'Hợp làm quà và trang trí bàn',
      description: 'Kích thước nhỏ gọn, đặt cạnh bàn phím hoặc màn hình đều vừa.',
    },
  ],

  notes: [
    'Đây là sản phẩm custom làm theo yêu cầu, không áp dụng đổi trả vì lý do đổi ý.',
    'Màu thực tế có thể lệch nhẹ so với màu hiển thị trên màn hình của bạn.',
    'Vui lòng kiểm tra kỹ nội dung từng phím trước khi đặt — nội dung đã in không sửa được.',
  ],

  // Cấu hình Pancake: để trống thì dùng PANCAKE_PRODUCT_ID / PANCAKE_VARIANT_ID mặc định.
  pancake: {
    productIdEnvKey: 'PANCAKE_PRODUCT_ID',
    variantIdEnvKey: 'PANCAKE_VARIANT_ID',
  },

  active: true,
};
