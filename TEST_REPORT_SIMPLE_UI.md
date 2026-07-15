# Báo cáo kiểm thử — giao diện custom tối giản

## Phần đã thay đổi

- Bỏ toàn bộ phần giới thiệu sản phẩm dài ở đầu trang custom.
- Trang sản phẩm đi thẳng vào 4 bước thiết kế.
- Thanh bước chuyển thành dạng vòng tròn nối ngang giống mockup.
- Toàn bộ thao tác nằm trong một card chính duy nhất.
- Preview được đặt ngay trong card.
- Giá hiện tại hiển thị nhỏ ở đầu card và cập nhật theo số phím.
- Bỏ bảng giá dài ở bước 1; khách chỉ cần tăng/giảm số phím.
- 7 bộ màu được thu gọn thành grid 4 cột trên desktop, 2 cột trên mobile.
- Giữ nguyên chức năng phóng to và tải ảnh preview.
- Giữ nguyên khôi phục thiết kế, bắt đầu lại, lưu localStorage, backend, Supabase và Pancake adapter.

## Kết quả tự động

- TypeScript typecheck: đạt.
- ESLint: 0 lỗi.
- Vitest: 104/104 test đạt.
- Production build: đạt.
- Trang `/products/custom-clicker`: HTTP 200.
- Logo: HTTP 200.
- Clicky MP3: HTTP 200.
- Smooth MP3: HTTP 200.
- SVG icon: HTTP 200.

## Các nhóm chức năng đã được test

- Bảng giá 3–12 phím.
- Công thức từ phím thứ 8 cộng 20.000đ/phím.
- Backend tự tính lại giá, không tin giá frontend.
- Validation số điện thoại và thông tin nhận hàng.
- Giới hạn nội dung phím và xử lý emoji.
- Danh mục 5 icon chính thức.
- Màu icon đi theo màu chữ của bộ màu.
- Mã đơn, idempotency và chống đơn trùng.
- Honeypot chống bot.
- Cấu hình màu sản phẩm.
- Build Netlify với Node.js 22.

## Kiểm tra thật cần thực hiện sau deploy

Để kiểm tra kết nối tài khoản của shop, hãy tạo một đơn thử trên Netlify rồi xác nhận dữ liệu xuất hiện trong Supabase/Pancake. Không thể kiểm tra kết nối tài khoản thật khi không có biến môi trường bí mật của shop.
