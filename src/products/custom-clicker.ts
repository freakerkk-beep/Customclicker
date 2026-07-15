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
    { src: '/products/custom-clicker/clicker-1.svg', alt: 'Custom Clicker Raccoonie bộ màu Milk Tea Pastel' },
    { src: '/products/custom-clicker/clicker-2.svg', alt: 'Custom Clicker bộ màu Taro Sweet' },
    { src: '/products/custom-clicker/clicker-3.svg', alt: 'Custom Clicker bộ màu Honey Vanilla' },
  ],
  thumbnailUrl: '/products/custom-clicker/clicker-1.svg',

  pricing: CLICKER_PRICING,
  productionTime: '3 – 5 ngày làm việc kể từ khi chốt đơn',

  /**
   * BẢY BỘ MÀU — lấy đúng theo web cũ của Raccoonie.
   *
   * Màu được ĐO TRỰC TIẾP từ ảnh chụp web cũ (từng pixel của đế / phím / chữ),
   * không phải ước lượng bằng mắt, nên khay xem trước hiện đúng như bản đang bán.
   *
   * `code` là mã vật liệu theo thứ tự đế/phím/chữ. Lưu ý: mã chỉ dùng để hiển
   * thị và trao đổi với xưởng — KHÔNG dùng mã để suy ra màu, vì cùng một mã khi
   * làm đế và khi làm phím lên màu khác nhau (ví dụ M05 ở đế đậm hơn ở phím).
   */
  palettes: [
    {
      id: 'milk-tea-pastel',
      name: 'Milk Tea Pastel',
      code: 'M05/M06/M05',
      tray: '#B93338',
      key: '#F1BAC4',
      text: '#7E2934',
    },
    {
      id: 'matcha-cream',
      name: 'Matcha Cream',
      code: 'M15/M02/M15',
      tray: '#53633F',
      key: '#F6F3EC',
      text: '#414F31',
    },
    {
      id: 'cherry-cream',
      name: 'Cherry Cream',
      code: 'M16/M05/M02',
      tray: '#E9DAC0',
      key: '#981C21',
      text: '#FDF4EC',
    },
    {
      id: 'black-white-classic',
      name: 'Black White Classic',
      code: 'M10/M02/M10',
      tray: '#1D1D1D',
      key: '#F3EEE5',
      text: '#1D1D1D',
    },
    {
      id: 'taro-sweet',
      name: 'Taro Sweet',
      code: 'M02/M17/M13',
      tray: '#F3EEE5',
      key: '#B19CCE',
      text: '#C09726',
    },
    {
      id: 'orange-pop',
      name: 'Orange Pop',
      code: 'M03/M04/M02',
      tray: '#9EC6A8',
      key: '#E36B34',
      text: '#FFF3E8',
    },
    {
      id: 'honey-vanilla',
      name: 'Honey Vanilla',
      code: 'M02/S16/S19',
      tray: '#F3EEE5',
      key: '#E4C04F',
      text: '#4F3A20',
    },
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
