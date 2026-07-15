# Raccoonie — Custom Clicker

Website đặt hàng **Custom Clicker** làm thủ công theo yêu cầu. Khách tự chọn số phím,
bộ màu, nội dung từng phím và loại switch, xem trước ngay trên màn hình rồi đặt đơn.

Toàn bộ giao diện bằng **tiếng Việt**.

> **Bạn không cần biết lập trình để chạy được website này.**
> Hãy làm lần lượt từ Bước 1 tới Bước 20 ở dưới. Mỗi bước đều có lệnh cụ thể để copy.

---

## Mục lục

| Phần | Nội dung                       | Bước        |
| ---- | ------------------------------ | ----------- |
| A    | Chạy thử trên máy của bạn      | 1 – 5       |
| B    | Tạo cơ sở dữ liệu Supabase     | 6 – 9       |
| C    | Khai báo biến môi trường       | 10 – 12     |
| D    | Đưa logo và ảnh sản phẩm vào   | 13 – 14     |
| E    | Đưa website lên mạng (Netlify) | 15 – 18     |
| F    | Bật đồng bộ Pancake            | 19 – 20     |
| G    | Tự chỉnh sửa về sau            | (tham khảo) |

---

## Công nghệ sử dụng

React + Vite + TypeScript + Tailwind CSS + React Router · Netlify Functions (backend) ·
Supabase (cơ sở dữ liệu) · Zod (kiểm tra dữ liệu) · Lucide React (icon giao diện) ·
SVG riêng của Raccoonie (icon trên phím) · Vitest (test).

**Không dùng Next.js.**

---

## ⚠️ Đọc trước khi bắt đầu — 3 điều quan trọng

**1. File `package-lock.json` đã có sẵn và đã được kiểm tra với Node.js 22.**
Không đưa thư mục `node_modules` lên GitHub. Khi cài lại, dùng `npm ci` để lấy đúng phiên bản
thư viện đã kiểm thử.

**2. Logo, âm thanh và 5 SVG icon chính thức đã nằm sẵn trong dự án.**
Bạn không cần copy lại. Chúng nằm trong `public/assets/`, `public/audio/` và
`public/assets/icons/`.

**3. Đơn hàng chỉ chạy được sau khi làm xong Phần B và C.**
Nếu bỏ qua Supabase, bạn vẫn xem được giao diện và bấm thử configurator, nhưng bấm
"Đặt hàng" sẽ báo lỗi vì chưa có nơi lưu đơn.

---

# PHẦN A — Chạy thử trên máy của bạn

## Bước 1. Cài Node.js

Vào <https://nodejs.org> và tải bản **LTS** (số phiên bản phải từ **22 trở lên**).
Cài như phần mềm bình thường: bấm Next → Next → Finish.

Cài xong, mở **Terminal** (macOS) hoặc **PowerShell** (Windows) và gõ:

```bash
node -v
```

Nếu hiện ra `v22.x.x` là được. Nếu báo "command not found",
hãy khởi động lại máy rồi thử lại.

## Bước 2. Giải nén và mở thư mục dự án

Giải nén `raccoonie-custom-clicker.zip`. Sau đó trong Terminal, gõ `cd ` (có dấu cách ở
cuối) rồi **kéo thả thư mục vừa giải nén vào cửa sổ Terminal** và bấm Enter:

```bash
cd đường/dẫn/tới/raccoonie-custom-clicker
```

Kiểm tra đã đúng chỗ chưa:

```bash
ls
```

Phải thấy các file như `package.json`, `index.html`, `netlify.toml`.

## Bước 3. Cài thư viện

```bash
npm ci
```

Lệnh này tải đúng các phiên bản đã khóa trong `package-lock.json` (mất 1 – 3 phút, cần mạng)
và tạo thư mục `node_modules`.

## Bước 4. Chạy website

```bash
npm run dev
```

Terminal sẽ hiện dòng `Local: http://localhost:5173/`. Mở link đó bằng trình duyệt.
Bạn sẽ thấy trang chủ Raccoonie và bấm thử được configurator.

Muốn dừng: bấm `Ctrl + C` trong Terminal.

## Bước 5. Chạy kiểm thử (không bắt buộc)

```bash
npm test
```

Bộ test kiểm tra bảng giá, số điện thoại, mã đơn và logic tính giá phía máy chủ.
Tất cả phải hiện màu xanh (passed).

Các lệnh khác có sẵn:

| Lệnh                | Tác dụng                                  |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Chạy thử trên máy                         |
| `npm run build`     | Đóng gói bản chạy thật vào thư mục `dist` |
| `npm run preview`   | Xem thử bản `dist`                        |
| `npm run typecheck` | Kiểm tra lỗi kiểu TypeScript              |
| `npm run lint`      | Kiểm tra lỗi code                         |
| `npm run format`    | Tự canh chỉnh code cho đẹp                |
| `npm test`          | Chạy test                                 |

---

# PHẦN B — Tạo cơ sở dữ liệu Supabase

## Bước 6. Tạo tài khoản và project

1. Vào <https://supabase.com> → **Start your project** → đăng nhập bằng GitHub.
2. Bấm **New project**.
3. Đặt tên: `raccoonie-custom-clicker`.
4. Mục **Database Password**: bấm **Generate a password** rồi **lưu lại vào chỗ an toàn**.
5. **Region**: chọn **Southeast Asia (Singapore)** cho gần Việt Nam, web sẽ nhanh hơn.
6. Bấm **Create new project** rồi đợi khoảng 2 phút.

## Bước 7. Tạo các bảng dữ liệu

1. Trong Supabase, nhìn cột trái, bấm biểu tượng **SQL Editor**.
2. Bấm **New query**.
3. Mở file `supabase/schema.sql` trong thư mục dự án bằng Notepad / TextEdit.
4. **Copy toàn bộ nội dung** rồi dán vào ô SQL Editor.
5. Bấm nút **Run** (hoặc `Ctrl + Enter`).

Thấy dòng chữ **Success. No rows returned** màu xanh là xong.

> File này tạo các bảng `products`, `product_options`, `orders`, `order_items`,
> `order_events`, bật bảo mật RLS, và tạo kho ảnh `order-previews`.
> Chạy lại nhiều lần cũng không sao (đã viết kiểu `if not exists`).

## Bước 8. Kiểm tra lại

Bấm **Table Editor** ở cột trái. Bạn phải thấy 5 bảng vừa tạo, và bảng `products` đã có
sẵn 1 dòng "Custom Clicker Raccoonie".

## Bước 9. Lấy khoá kết nối

Vào **Project Settings** (bánh răng ở góc dưới trái) → **API**. Giữ tab này mở, Bước 10 cần
3 giá trị sau:

| Tên trên Supabase       | Dùng cho biến               |
| ----------------------- | --------------------------- |
| Project URL             | `SUPABASE_URL`              |
| `anon` `public`         | `SUPABASE_ANON_KEY`         |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

> 🔒 **`service_role` là khoá VẠN NĂNG — nó bỏ qua mọi lớp bảo mật.**
> Không đưa cho ai, không chụp màn hình, không dán lên Facebook/Zalo để nhờ hỗ trợ.
> Nếu lỡ để lộ: quay lại trang này bấm **Reset** để tạo khoá mới.

---

# PHẦN C — Khai báo biến môi trường

## Bước 10. Tạo file `.env`

Trong Terminal (vẫn ở trong thư mục dự án):

```bash
cp .env.example .env
```

Trên Windows PowerShell dùng: `copy .env.example .env`

## Bước 11. Điền giá trị thật

Mở file `.env` bằng Notepad / TextEdit và điền vào:

```env
VITE_SITE_URL=http://localhost:5173
VITE_ZALO_URL=https://zalo.me/số-zalo-của-shop

SUPABASE_URL=dán Project URL ở Bước 9
SUPABASE_ANON_KEY=dán anon public key
SUPABASE_SERVICE_ROLE_KEY=dán service_role secret key

PANCAKE_SYNC_ENABLED=false
```

Phần Pancake cứ để trống và để `false` — Phần F sẽ xử lý sau.

## Bước 12. Hiểu quy tắc an toàn của biến

Đây là phần **quan trọng nhất về bảo mật**, đọc kỹ:

- Biến bắt đầu bằng **`VITE_`** sẽ bị **nhúng thẳng vào JavaScript gửi cho trình duyệt**.
  **Ai cũng xem được.** Chỉ để thông tin công khai (URL web, link Zalo).
- **`SUPABASE_SERVICE_ROLE_KEY`** và **`PANCAKE_API_KEY`** **TUYỆT ĐỐI không được đặt tên
  bắt đầu bằng `VITE_`**. Chúng chỉ chạy trong Netlify Functions (trên máy chủ).
- File `.env` **không bao giờ được đưa lên GitHub**. File `.gitignore` đã chặn sẵn.

Sau khi sửa `.env`, phải **tắt `npm run dev` và chạy lại** thì mới có tác dụng.

---

# PHẦN D — Logo và ảnh sản phẩm

## Bước 13. Đặt logo vào đúng chỗ

Logo chính thức đã được đặt sẵn tại:

```
public/assets/logo-raccoonie.png
```

Chỉ thay file này khi shop đổi logo. Giữ nguyên tên file để không phải sửa code.

## Bước 14. Thay ảnh sản phẩm và âm thanh (không bắt buộc)

- **Ảnh sản phẩm**: hiện là 3 file SVG vẽ tạm trong `public/products/custom-clicker/`.
  Chụp ảnh thật, copy vào thư mục đó, rồi sửa đường dẫn trong
  `src/products/custom-clicker.ts` (phần `images`).
- **Âm thanh switch**: đã có sẵn `public/audio/clicky.mp3` và `public/audio/smooth.mp3`.
  Muốn đổi âm thanh chỉ cần ghi đè đúng hai file này và giữ nguyên tên.

---

# PHẦN E — Đưa website lên mạng

## Bước 15. Đưa code lên GitHub

1. Tạo tài khoản tại <https://github.com> nếu chưa có.
2. Bấm **New repository**, đặt tên `raccoonie-custom-clicker`, chọn **Private**, bấm
   **Create repository**. **Không** tích thêm README/gitignore nào.
3. Trong Terminal, tại thư mục dự án, chạy lần lượt:

```bash
git init
git add .
git commit -m "Raccoonie Custom Clicker"
git branch -M main
git remote add origin https://github.com/TÊN-CỦA-BẠN/raccoonie-custom-clicker.git
git push -u origin main
```

> ✅ Yên tâm: `.gitignore` đã chặn `.env` và `node_modules`, nên khoá bí mật **không** bị
> đẩy lên GitHub. Còn `package-lock.json` thì **nên** được đẩy lên — đó là điều tốt.

## Bước 16. Tạo site trên Netlify

1. Vào <https://netlify.com> → đăng nhập bằng GitHub.
2. **Add new site** → **Import an existing project** → **GitHub**.
3. Chọn kho `raccoonie-custom-clicker`.
4. Các ô Build command / Publish directory **để nguyên** — file `netlify.toml` đã khai báo sẵn:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. **Khoan bấm Deploy** — làm Bước 17 trước.

## Bước 17. Khai báo biến môi trường trên Netlify

Bấm **Add environment variables** (hoặc vào **Site configuration → Environment variables**),
thêm từng biến một — **copy y hệt từ file `.env`**, trừ `VITE_SITE_URL`:

| Biến                        | Giá trị                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `VITE_SITE_URL`             | Địa chỉ Netlify thật, ví dụ `https://raccoonie.netlify.app` (**không** có dấu `/` cuối) |
| `VITE_ZALO_URL`             | Link Zalo của shop                                                                      |
| `SUPABASE_URL`              | Từ Bước 9                                                                               |
| `SUPABASE_ANON_KEY`         | Từ Bước 9                                                                               |
| `SUPABASE_SERVICE_ROLE_KEY` | Từ Bước 9 — 🔒 bí mật                                                                   |
| `PANCAKE_SYNC_ENABLED`      | `false`                                                                                 |

Rồi bấm **Deploy site**. Đợi 2 – 4 phút.

## Bước 18. Kiểm tra website thật

1. Mở địa chỉ Netlify vừa cấp.
2. Kiểm tra backend còn sống: mở
   `https://tên-site-của-bạn.netlify.app/.netlify/functions/health`
   → phải thấy chữ `"ok": true`.

   Trang này còn liệt kê **từng biến môi trường đã điền hay chưa** (`true` / `false`) —
   rất tiện để dò lỗi. Nó **chỉ báo đã cấu hình hay chưa, không hề in ra giá trị khoá bí mật**.
   Nếu `SUPABASE_URL` hoặc `SUPABASE_SERVICE_ROLE_KEY` là `false` thì bạn thiếu biến ở Bước 17.

3. **Đặt thử một đơn hàng** từ đầu tới cuối.
4. Vào Supabase → **Table Editor** → bảng `orders` → phải thấy đơn vừa đặt.
5. Vào trang **Tra cứu đơn**, nhập **mã đơn + số điện thoại** vừa dùng → phải xem được đơn.

> Đổi tên miền: **Site configuration → Change site name**. Nhớ sửa lại `VITE_SITE_URL`
> cho khớp rồi deploy lại (**Deploys → Trigger deploy**).

---

# PHẦN F — Đồng bộ Pancake

## Bước 19. Hiểu trước khi bật

Website **mặc định TẮT** đồng bộ Pancake (`PANCAKE_SYNC_ENABLED=false`), và điều này là
**cố ý**. Mỗi shop Pancake có endpoint và cấu trúc dữ liệu khác nhau, nên phần này cần bạn
đối chiếu với tài liệu Pancake của **chính shop mình** trước khi bật.

Mở file `netlify/functions/lib/pancake.ts`, tìm **3 chỗ** được đánh dấu:

```
[CẦN CHỈNH THEO TÀI LIỆU PANCAKE]
```

1. **Địa chỉ endpoint** tạo đơn.
2. **Cách ghép dữ liệu** (payload) — tên các trường gửi sang Pancake.
3. **Cách đọc mã đơn Pancake** trả về.

> 🛡️ **Đơn hàng không bao giờ bị mất.** Kể cả khi Pancake lỗi hoặc khai báo sai,
> đơn vẫn **được lưu vào Supabase trước**, khách vẫn nhận được mã đơn, và đơn được đánh dấu
> `pancake_sync_status = 'failed'` để bạn xử lý lại sau. Trang cảm ơn sẽ hiện thông báo
> trung thực là đơn đang chờ đồng bộ.

## Bước 20. Bật đồng bộ

Sau khi đã chỉnh xong 3 chỗ trên, vào Netlify → **Environment variables** và điền:

| Biến                     | Ghi chú                                  |
| ------------------------ | ---------------------------------------- |
| `PANCAKE_SYNC_ENABLED`   | đổi thành `true`                         |
| `PANCAKE_API_BASE_URL`   | ví dụ `https://pos.pancake.vn/api/v1`    |
| `PANCAKE_API_KEY`        | 🔒 bí mật                                |
| `PANCAKE_SHOP_ID`        |                                          |
| `PANCAKE_WAREHOUSE_ID`   |                                          |
| `PANCAKE_PRODUCT_ID`     |                                          |
| `PANCAKE_VARIANT_ID`     |                                          |
| `PANCAKE_WEBHOOK_SECRET` | 🔒 bí mật — thiếu thì webhook bị từ chối |

Deploy lại rồi đặt một đơn thử. Kiểm tra cột `pancake_sync_status` trong bảng `orders`
phải là `synced`.

**Webhook cập nhật trạng thái** (nếu Pancake hỗ trợ): trỏ webhook về

```
https://tên-site-của-bạn.netlify.app/.netlify/functions/pancake-webhook
```

Webhook có kiểm tra chữ ký HMAC-SHA256. Yêu cầu không có chữ ký hợp lệ sẽ bị trả về 401.

---

# PHẦN G — Tự chỉnh sửa về sau

## Đổi bảng giá

Sửa **một chỗ duy nhất**: `shared/pricing.ts`

```ts
export const CLICKER_PRICING: PricingConfig = {
  minCharacters: 3, // số ký tự tối thiểu
  maxCharacters: 12, // số ký tự tối đa
  fixedTable: {
    // bảng giá cố định
    3: 79_000,
    4: 99_000,
    5: 119_000,
    6: 139_000,
    7: 149_000,
  },
  extraFromCharacter: 7, // từ mốc này trở đi thì tính cộng thêm
  extraBasePrice: 149_000, // giá tại mốc số 7
  extraPricePerCharacter: 20_000, // mỗi ký tự vượt mốc cộng thêm
};
```

Ví dụ muốn đổi giá 5 ký tự thành 125.000đ: sửa dòng `5: 119_000` thành `5: 125_000`.
Muốn cho phép tối đa 15 ký tự: đổi `maxCharacters: 12` thành `15`.

File này được **cả giao diện lẫn máy chủ dùng chung**, nên sửa ở đây là giá đổi ở mọi nơi:
bảng giá, tổng tiền, và cả giá máy chủ tính lại khi lưu đơn.

> 🔒 **Máy chủ LUÔN tự tính lại giá** và không bao giờ tin giá do trình duyệt gửi lên.
> Khách có sửa giá trong trình duyệt cũng vô ích.

Bảng giá hiện tại:

| Số ký tự | Giá      | Số ký tự | Giá      |
| -------- | -------- | -------- | -------- |
| 3        | 79.000đ  | 8        | 169.000đ |
| 4        | 99.000đ  | 9        | 189.000đ |
| 5        | 119.000đ | 10       | 209.000đ |
| 6        | 139.000đ | 11       | 229.000đ |
| 7        | 149.000đ | 12       | 249.000đ |

Từ ký tự thứ 8 trở đi: `149.000 + (số ký tự − 7) × 20.000`.

## Thêm / đổi bộ màu, icon, mô tả

Sửa `src/products/custom-clicker.ts` — **không cần đụng vào component nào**.

```ts
palettes: [
  {
    id: 'milk-tea-pastel',
    name: 'Milk Tea Pastel',
    tray: '#C23B3B',
    key: '#F3C2CB',
    text: '#8A2E3A',
  },
  // thêm bộ màu mới ở đây
];
```

- `tray` = màu khay, `key` = màu phím, `text` = màu chữ **và icon** trên phím.
- Danh mục hiện chỉ có 5 icon chính thức: Trái tim, Ngôi sao, Hoa, Dấu chân thú và Cỏ bốn lá.
- ID hợp lệ nằm ở `shared/icons.ts`; hình SVG React nằm ở `src/utils/icons.tsx`.
- File SVG gốc được lưu thêm trong `public/assets/icons/`.

## Thêm sản phẩm mới

1. Copy `src/products/custom-clicker.ts` thành file mới, đổi `id` và `slug`.
2. Mở `src/products/productRegistry.ts`, import file mới và thêm vào mảng `PRODUCTS`.
3. Xong — trang `/products/slug-mới` tự động chạy, không phải sửa gì thêm.

## Đổi màu thương hiệu / phông chữ

`tailwind.config.js` (mã màu) và `index.html` (link Google Fonts).

| Màu         | Mã        |
| ----------- | --------- |
| Chủ đạo     | `#7A3732` |
| Chủ đạo đậm | `#5F2925` |
| Nền kem     | `#FFF9F3` |
| Viền        | `#EADBD5` |
| Chữ         | `#3A2927` |

---

## Cấu trúc dự án

```
raccoonie-custom-clicker/
├─ shared/              ⭐ Code DÙNG CHUNG cho cả web lẫn máy chủ
│  ├─ pricing.ts           Bảng giá — NGUỒN DUY NHẤT
│  ├─ icons.ts             5 icon được phép — dùng chung frontend/backend
│  ├─ orderSchema.ts       Quy tắc kiểm tra dữ liệu đơn (Zod)
│  ├─ constants.ts         Giới hạn + trạng thái đơn
│  └─ phone.ts, currency.ts, sanitize.ts
├─ src/
│  ├─ products/         ⭐ Dữ liệu sản phẩm (sửa ở đây, không sửa component)
│  ├─ components/
│  │  ├─ configurator/     Các bước chọn phím, màu, switch, xem trước
│  │  ├─ layout/           Header, Footer
│  │  └─ ui/               Button, Card, Modal, Toast, Logo
│  ├─ pages/              Trang chủ, sản phẩm, đặt thành công, tra cứu
│  ├─ hooks/              Trạng thái configurator + lưu nháp
│  ├─ services/           Gọi API
│  ├─ utils/              Tiện ích
│  └─ tests/              Test
├─ netlify/functions/   ⭐ Máy chủ — nơi duy nhất giữ khoá bí mật
│  ├─ create-order.ts      Tạo đơn (tự tính lại giá, tự sinh mã đơn)
│  ├─ get-order.ts         Tra cứu đơn (cần mã đơn + SĐT)
│  ├─ pancake-webhook.ts   Nhận cập nhật trạng thái
│  ├─ health.ts            Kiểm tra máy chủ sống
│  └─ lib/                 Supabase, Pancake, mã đơn, rate limit
├─ supabase/schema.sql  ⭐ Chạy file này trong SQL Editor (Bước 7)
├─ public/assets/       ⭐ Logo + SVG icon chính thức
├─ public/audio/        ⭐ Âm thanh Clicky / Smooth
└─ .env.example         ⭐ Mẫu biến môi trường (Bước 10)
```

---

## Các lớp bảo vệ đã cài sẵn

| Lớp             | Cách hoạt động                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Giá             | Máy chủ luôn tính lại, không tin giá từ trình duyệt                                                                      |
| Mã đơn          | Chỉ máy chủ sinh, dạng `RAC-YYMMDD-XXXX`, bỏ ký tự dễ đọc nhầm (I, O, 0, 1)                                              |
| Xem đơn         | Phải có **cả** mã đơn **và** số điện thoại. Sai mã hay sai SĐT đều trả về cùng một lỗi 404 (không để lộ đơn nào có thật) |
| RLS             | Trình duyệt **không thể** đọc bảng `orders` dù có `anon key`                                                             |
| Khoá bí mật     | `service_role` và Pancake key chỉ tồn tại trong Netlify Functions                                                        |
| Chống spam      | Honeypot (ô ẩn `website`) + rate limit theo IP                                                                           |
| Chống đặt trùng | `idempotencyKey` — bấm đúp hoặc thử lại chỉ tạo **một** đơn                                                              |
| Chống mất đơn   | Pancake lỗi → đơn vẫn lưu + vẫn có mã đơn, đánh dấu chờ đồng bộ lại                                                      |
| Trung thực      | Chỉ hiện "đặt hàng thành công" **sau khi** máy chủ xác nhận đã lưu                                                       |

---

## Gặp lỗi thì làm gì?

| Hiện tượng                                | Cách xử lý                                                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm: command not found`                  | Chưa cài Node.js (Bước 1) hoặc chưa khởi động lại máy                                              |
| `npm install` báo lỗi mạng                | Kiểm tra internet, thử `npm cache clean --force` rồi cài lại                                       |
| Trang trắng sau khi deploy                | Netlify → **Deploys** → bấm vào bản mới nhất → đọc log tìm dòng đỏ                                 |
| Đặt hàng báo "Không kết nối được máy chủ" | Thiếu biến môi trường trên Netlify (Bước 17). Kiểm tra `/.netlify/functions/health`                |
| `Thiếu biến môi trường: SUPABASE_URL`     | Điền biến trên Netlify rồi **Trigger deploy** lại (thêm biến xong phải deploy lại mới có tác dụng) |
| Đơn lưu được nhưng không sang Pancake     | Bình thường khi `PANCAKE_SYNC_ENABLED=false`. Muốn bật, xem Phần F                                 |
| Logo không hiện                           | Sai tên file. Phải đúng `public/assets/logo-raccoonie.png`                                         |
| Nút "Nghe thử" không thấy                 | Chưa có file mp3 trong `public/audio/` — nút tự ẩn (Bước 14)                                       |
| Sửa `.env` mà không thấy đổi              | Tắt `npm run dev` (`Ctrl + C`) rồi chạy lại                                                        |

---

## Ghi chú về tình trạng kiểm thử

Bản cập nhật này đã được kiểm tra trực tiếp bằng Node.js 22:

- ✅ `npm run typecheck`: không có lỗi TypeScript.
- ✅ `npm run lint`: không có lỗi hoặc cảnh báo ESLint.
- ✅ `npm test`: **104/104 test vượt qua** trên 5 file test.
- ✅ `npm run build`: Vite production build thành công.
- ✅ Server local trả HTTP 200 cho trang chủ, file Clicky MP3 và SVG icon.
- ✅ Kiểm tra đúng bảng giá 3–12 ký tự và backend không tin giá frontend.
- ✅ Kiểm tra đúng 7 bộ màu theo file `index.html` mẫu.
- ✅ Kiểm tra chỉ 5 icon hợp lệ; icon ngoài danh mục bị frontend và backend từ chối.
- ✅ Kiểm tra SVG dùng `currentColor`, nên icon đổi theo màu chữ của từng bộ màu.

Không thể kiểm thử đơn thật trên Supabase/Pancake khi chưa có biến môi trường và API key của
shop. Sau khi deploy, hãy tạo một đơn thử và kiểm tra bảng `orders`, `order_items` và trạng thái
`pancake_sync_status` trước khi nhận đơn khách thật.

---

## Cần trợ giúp?

Khi hỏi ai đó, hãy gửi kèm: (1) ảnh chụp thông báo lỗi, (2) log build trên Netlify,
(3) bước bạn đang làm.

**Đừng bao giờ gửi kèm file `.env` hay `service_role key`.**

---

# PHẦN H — Đổi giao diện & thêm sản phẩm mới

Phần này ghi lại những thứ hay phải sửa nhất, để lần sau bạn (hoặc người khác)
không phải đi dò khắp code.

## H1. Font chữ in trên phím

File font đặt tại `public/fonts/BeVietnamPro-Bold.ttf`, khai báo trong
`src/index.css` với tên `Clicker Key`, và dùng qua class Tailwind `font-key`.

Muốn đổi sang font khác:

1. Chép file `.ttf` mới vào `public/fonts/`.
2. Sửa đường dẫn trong khối `@font-face` ở `src/index.css`.

Font này **không tải từ Google Fonts** — dùng đúng file gốc để chữ xem trước
giống hệt chữ in ra sản phẩm thật.

## H2. Đổi tông màu website

Toàn bộ tông màu nằm ở **một chỗ**: `tailwind.config.js`, mục `colors`.

| Token                       | Ý nghĩa                                         | Giá trị hiện tại      |
| --------------------------- | ----------------------------------------------- | --------------------- |
| `primary`                   | Hồng — nút, bước đang chọn, tiêu đề bước        | `#ED5A8A`             |
| `accent`                    | Tím — nhãn mục ("BỘ MÀU (7 MẪU)")               | `#7A56F0`             |
| `brandPink` → `brandPurple` | Gradient nút chính & chữ hiệu                   | `#E35A92` → `#8157E9` |
| `pageFrom` → `pageTo`       | Gradient nền trang (khai báo ở `src/index.css`) | `#F9EEF8` → `#EAF1FE` |

Đổi giá trị ở đây là cả website đổi theo. Nếu đổi màu hồng chính, nhớ sửa luôn
`<meta name="theme-color">` trong `index.html` (màu thanh trình duyệt trên điện thoại).

## H3. Sửa 7 bộ màu sản phẩm

Nằm ở `src/products/custom-clicker.ts`, mục `palettes`. Mỗi bộ gồm:

- `tray` (đế), `key` (phím), `text` (chữ/icon) — mã HEX đồng bộ đúng theo file `index.html` mẫu.
- `code` — mã vật liệu đế/phím/chữ, ví dụ `M05/M06/M05`, chỉ để hiển thị.

> **Lưu ý:** đừng suy màu từ `code`. Khi cần đổi màu, sửa trực tiếp `tray`, `key` và
> `text`, rồi chạy `npm test` để kiểm tra cấu hình.

Đổi `id` của bộ màu thì nhớ sửa cả `src/tests/serverPricing.test.ts` và
`src/tests/validation.test.ts` — hai test này có ghi `colorPaletteId` cố định.

## H4. Thêm một sản phẩm clicker mới

Website đã dựng sẵn cho nhiều sản phẩm: trang chủ tự liệt kê, đường dẫn
`/products/<slug>` tự hoạt động.

1. Tạo file mới trong `src/products/`, ví dụ `mini-clicker.ts`, copy cấu trúc từ
   `custom-clicker.ts` rồi sửa `id`, `slug`, `name`, `pricing`, `palettes`.
2. Thêm ảnh vào `public/products/<slug>/`.
3. Mở `src/products/productRegistry.ts`, import file vừa tạo và thêm vào mảng
   `PRODUCTS`.

Xong. Không phải sửa trang chủ hay router.

> Sau này muốn quản lý sản phẩm bằng Supabase thay vì file code, chỉ cần thay
> phần thân 3 hàm trong `productRegistry.ts` bằng lời gọi API — phần còn lại của
> website giữ nguyên.

## H5. Số ký tự trên phím

Giới hạn 4 ký tự đặt ở `shared/constants.ts` (`LIMITS.keyTextMaxLength`).

Chữ trên phím đếm theo **ký tự nhìn thấy**, nên 1 emoji = 1 ký tự (`🎉` tuy dài
2 đơn vị trong JavaScript nhưng vẫn tính là 1). Logic này ở `shared/sanitize.ts`
và được dùng chung cho cả trình duyệt lẫn máy chủ, nên hai bên không thể lệch nhau.
