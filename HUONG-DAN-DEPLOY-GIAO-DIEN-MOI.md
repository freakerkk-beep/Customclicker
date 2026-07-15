# Hướng dẫn deploy giao diện custom tối giản

## Cách an toàn nhất: upload toàn bộ source mới

1. Giải nén file `raccoonie-custom-clicker-simple-ui.zip`.
2. Mở thư mục `raccoonie-custom-clicker` bên trong.
3. Trên GitHub, mở repository đang kết nối với Netlify.
4. Chọn **Add file → Upload files**.
5. Kéo toàn bộ nội dung trong thư mục project vào khu vực upload.
6. Không upload `.env`, `node_modules`, `dist` hoặc các file `*.tsbuildinfo`.
7. Commit với nội dung: `Simplify product configurator UI`.
8. Netlify thường tự deploy. Nếu không, vào **Deploys → Trigger deploy → Clear cache and deploy site**.
9. Chờ trạng thái **Published**.
10. Mở website bằng cửa sổ ẩn danh hoặc nhấn `Command + Shift + R` để tránh cache cũ.

## Không cần nhập lại biến môi trường

Nếu vẫn dùng cùng một Netlify site, các biến Supabase và Pancake đã lưu trên Netlify sẽ được giữ nguyên.

## Kiểm tra sau deploy

- Trang chủ vẫn hiển thị sản phẩm.
- Bấm sản phẩm sẽ đi thẳng tới card custom tối giản.
- Giá hiện tại thay đổi ngay khi tăng/giảm số phím.
- 3 phím = 79.000đ; 7 phím = 149.000đ; 8 phím = 169.000đ; 12 phím = 249.000đ.
- Chọn 7 bộ màu và kiểm tra preview đổi đúng.
- Chọn chữ/icon cho từng phím; màu icon đổi theo màu chữ của bộ màu.
- Clicky và Smooth phát đúng file âm thanh.
- Đặt một đơn thử rồi kiểm tra bảng `orders` và `order_items` trong Supabase.
