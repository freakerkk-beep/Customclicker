# Báo cáo kiểm thử — Raccoonie Custom Clicker

Ngày kiểm tra: 15/07/2026  
Môi trường: Node.js 22.16.0, npm 10.9.2

## Phần đã cập nhật

- Chỉ giữ 5 icon chính thức: Trái tim, Ngôi sao, Hoa, Dấu chân thú, Cỏ bốn lá.
- Dùng đúng hình SVG do shop cung cấp, không dùng icon thay thế của Lucide.
- SVG dùng `currentColor`; màu icon tự lấy từ trường `text` của bộ màu.
- Màu icon đổi đồng thời trong khay xem trước, phím thu nhỏ và bộ chọn icon.
- Backend chỉ chấp nhận đúng 5 ID icon; icon cũ hoặc icon giả bị từ chối.
- Bản nháp localStorage chứa icon cũ được làm sạch để khách chọn lại.
- Đồng bộ lại 7 bộ màu theo đúng mã HEX trong file `index.html` mẫu.
- Giữ nguyên bảng giá 3–12 ký tự và toàn bộ luồng đặt hàng hiện có.

## Kết quả chạy lệnh tổng hợp

Lệnh:

```bash
npm run verify
```

Kết quả:

- TypeScript typecheck: đạt.
- ESLint: đạt, 0 lỗi và 0 cảnh báo.
- Vitest: 5/5 file test đạt, 104/104 test đạt.
- Vite production build: đạt.

## Nội dung test

- Bảng giá 3–12 ký tự.
- Số lượng và tổng tiền.
- Backend tự tính lại giá, không tin giá frontend.
- Số điện thoại Việt Nam và chuẩn hóa +84/84/0.
- Mã đơn `RAC-YYMMDD-XXXX` và chống trùng.
- Bắt buộc xác nhận thiết kế.
- Bắt buộc nội dung ở mọi phím.
- Giới hạn 4 ký tự nhìn thấy, emoji được đếm đúng.
- Honeypot và idempotency key.
- Bộ màu, switch và icon phải tồn tại trong cấu hình sản phẩm.
- Chỉ 5 icon chính thức được chấp nhận.
- SVG có `currentColor` và đổi theo màu của bộ phối.
- 7 bộ màu khớp file `index.html` mẫu.
- Logo, 2 file âm thanh và 5 file SVG đều tồn tại, đọc được và không rỗng.
- Trang Vite local trả HTTP 200.
- File Clicky MP3 và SVG icon trả HTTP 200.

## Mã màu đã đối chiếu

| Bộ màu              | Đế        | Phím      | Chữ/icon  |
| ------------------- | --------- | --------- | --------- |
| Milk Tea Pastel     | `#C23B3B` | `#F3C2CB` | `#8A2E3A` |
| Matcha Cream        | `#5E6E45` | `#F7F5EE` | `#4A5A36` |
| Cherry Cream        | `#ECDFC6` | `#A31F1F` | `#FDF6EE` |
| Black White Classic | `#1F1F1F` | `#F5F0E8` | `#1F1F1F` |
| Taro Sweet          | `#F5F0E8` | `#B9A6D6` | `#C8A200` |
| Orange Pop          | `#A8CDB0` | `#E8772E` | `#FFF5EA` |
| Honey Vanilla       | `#F5F0E8` | `#E8C84A` | `#5A4220` |

## Giới hạn kiểm thử

Chưa thể gửi đơn thật tới Supabase và Pancake vì môi trường kiểm tra không có khóa bí mật của shop. Sau khi deploy, cần tạo một đơn thử và kiểm tra:

1. Bảng `orders` có đơn mới.
2. Bảng `order_items` có `custom_data` đúng.
3. Ảnh preview có URL nếu upload thành công.
4. `pancake_sync_status` là `disabled` khi chưa bật Pancake.
5. Sau khi cấu hình API Pancake thật, trạng thái chuyển thành `synced` và có `pancake_order_id`.
