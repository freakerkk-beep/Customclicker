# Báo cáo cập nhật giao diện

Đã cập nhật:

1. Thay ảnh bìa thẻ sản phẩm trang chủ bằng ảnh `public/products/custom-clicker/cover.png`.
2. Đổi khung ảnh sản phẩm trang chủ sang tỷ lệ vuông để không cắt ảnh bìa.
3. Phím trong preview và bước nhập nội dung luôn giữ tỷ lệ vuông, bo góc.
4. Từ 7–12 phím tự động xuống dòng:
   - 7–8 phím: 4 cột.
   - 9–10 phím: 5 cột.
   - 11–12 phím: 6 cột.
5. Xóa hoàn toàn huy hiệu trạng thái và khối “Tình trạng đơn” khỏi trang tra cứu/chi tiết đơn.
6. Giữ nguyên phần tích hợp Supabase và Pancake API của bản trước.

Kiểm tra:

- ESLint: đạt.
- Vitest: 104/104 test đạt.
- TypeScript + Vite production build: đạt.
