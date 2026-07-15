# Hướng dẫn deploy lại bản cập nhật

## Cách dễ nhất: upload đè lên repository GitHub hiện tại

### 1. Chuẩn bị

1. Giải nén file ZIP bản hoàn chỉnh.
2. Mở thư mục `raccoonie-custom-clicker` bên trong.
3. Nhấn `Command + Shift + .` trên Mac để hiện các file ẩn.
4. Phải nhìn thấy `.npmrc`, `.gitignore`, `.env.example`, `package.json`, `src`, `public`, `shared`, `netlify`.

Không upload:

- `.env`
- `node_modules`
- `dist`
- file `*.tsbuildinfo`

Các mục này đã được loại khỏi ZIP hoàn chỉnh.

### 2. Upload lên GitHub

1. Mở repository GitHub đang kết nối với Netlify.
2. Bấm `Add file` → `Upload files`.
3. Kéo toàn bộ nội dung bên trong thư mục dự án vào vùng upload. Không kéo thêm một thư mục cha bên ngoài.
4. Chờ GitHub tải hết file.
5. Nhập commit message:

```text
Update official icons and color palettes
```

6. Bấm `Commit changes`.

Các file trùng tên sẽ được cập nhật. Các file mới như `shared/icons.ts` và `public/assets/icons/*` sẽ được thêm vào.

### 3. Chờ Netlify tự build

Sau khi commit, Netlify thường tự deploy. Mở:

```text
Netlify → Deploys
```

Log đúng phải có:

```text
Now using node v22...
npm run build
✓ built in ...
Deploy succeeded
```

Nếu Netlify không tự chạy:

```text
Deploys → Trigger deploy → Clear cache and deploy site
```

### 4. Không cần nhập lại biến môi trường

Nếu bạn chỉ cập nhật code trong cùng một Netlify site, các Environment Variables cũ vẫn được giữ nguyên. Không upload file `.env` lên GitHub.

### 5. Kiểm tra website sau deploy

1. Mở trang sản phẩm bằng cửa sổ ẩn danh.
2. Nhấn `Command + Shift + R` để tải lại không dùng cache.
3. Chọn từng bộ màu và kiểm tra đế, phím, chữ/icon cùng đổi màu.
4. Vào phần icon: phải chỉ có 5 icon.
5. Chọn mỗi icon ít nhất một lần và xem preview.
6. Bấm nghe thử Clicky và Smooth.
7. Kiểm tra giá 3 phím là 79.000đ, 7 phím là 149.000đ, 8 phím là 169.000đ, 12 phím là 249.000đ.
8. Tạo một đơn thử.

### 6. Kiểm tra Supabase

Sau khi tạo đơn thử:

- Bảng `orders`: có mã đơn mới.
- Bảng `order_items`: `custom_data.keys` lưu đúng ID icon như `heart`, `dog_feet`, `lucky_leaf`.
- Nếu Pancake chưa bật: `pancake_sync_status = disabled`.
- Nếu Pancake đã bật đúng: `pancake_sync_status = synced` và có `pancake_order_id`.

## Khi Netlify vẫn hiện bản cũ

Làm lần lượt:

1. `Deploys → Trigger deploy → Clear cache and deploy site`.
2. Đợi trạng thái `Published`.
3. Mở web ẩn danh hoặc xóa cache trình duyệt.
4. Kiểm tra Netlify đang deploy đúng branch `main` và đúng repository.
