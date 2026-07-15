/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /**
         * TÔNG HỒNG–TÍM lấy đúng theo web cũ (đo từ ảnh chụp giao diện).
         * Mọi component đều dùng các token này nên đổi tông chỉ sửa ở đây.
         */
        primary: {
          DEFAULT: '#ED5A8A', // hồng: nút, bước đang chọn, tiêu đề bước
          dark: '#D64277', // hover
          soft: '#FFD0E3', // nền hồng nhạt, bước chưa tới
        },
        accent: {
          DEFAULT: '#7A56F0', // tím: nhãn mục ("SỐ LƯỢNG PHÍM", "BỘ MÀU")
          dark: '#6440D6',
          soft: '#EDE9FE',
        },
        /** Hai đầu gradient của nút chính và chữ tiêu đề. */
        brandPink: '#E35A92',
        brandPurple: '#8157E9',
        /** Hai đầu gradient của nền trang. */
        pageFrom: '#F9EEF8',
        pageTo: '#EAF1FE',
        cream: '#FBF5FC',
        card: '#FFFFFF',
        line: '#F0E3F3',
        ink: {
          DEFAULT: '#2F2A38',
          muted: '#8B8494',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        /**
         * Chữ in trên phím clicker — dùng đúng file font khách gửi.
         * Xếp thêm font emoji phía sau để emoji trên phím vẫn hiện màu,
         * vì file .ttf chữ không chứa glyph emoji.
         */
        key: [
          '"Clicker Key"',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Noto Color Emoji"',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 2px 10px rgba(120, 60, 130, 0.06)',
        lift: '0 6px 22px rgba(120, 60, 130, 0.12)',
      },
    },
  },
  plugins: [],
};
