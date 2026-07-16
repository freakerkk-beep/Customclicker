-- =====================================================================
-- RACCOONIE CUSTOM CLICKER — Supabase schema
-- ---------------------------------------------------------------------
-- Cách chạy: mở Supabase → SQL Editor → New query → dán toàn bộ file này
-- → bấm Run. Chạy lại nhiều lần cũng an toàn (dùng IF NOT EXISTS).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Hàm tự cập nhật updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- BẢNG: products
-- Phiên bản này website đọc sản phẩm từ file cấu hình trong code.
-- Bảng này để sẵn cho giai đoạn sau khi chuyển sang quản lý bằng dashboard.
-- =====================================================================
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text not null unique,
  description         text,
  template_type       text not null default 'clicker',
  base_price          integer not null default 0 check (base_price >= 0),
  thumbnail_url       text,
  active              boolean not null default true,
  pancake_product_id  text,
  pancake_variant_id  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_active_idx on public.products (active) where active = true;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- =====================================================================
-- BẢNG: product_options
-- =====================================================================
create table if not exists public.product_options (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete cascade,
  option_key     text not null,
  option_name    text not null,
  option_type    text not null,
  option_values  jsonb not null default '[]'::jsonb,
  required       boolean not null default false,
  sort_order     integer not null default 0,
  unique (product_id, option_key)
);

create index if not exists product_options_product_id_idx on public.product_options (product_id);
create index if not exists product_options_sort_idx on public.product_options (product_id, sort_order);

-- =====================================================================
-- BẢNG: orders
-- =====================================================================
create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  order_code           text not null unique,
  customer_name        text not null,
  customer_phone       text not null,
  customer_email       text,
  province             text not null,
  district             text not null,
  ward                 text not null,
  address_detail       text not null,
  customer_note        text,
  subtotal             integer not null check (subtotal >= 0),
  shipping_fee         integer check (shipping_fee >= 0),
  total                integer not null check (total >= 0),
  status               text not null default 'new'
                         check (status in ('new','confirmed','paid','in_production',
                                           'ready_to_ship','shipping','completed','cancelled')),
  pancake_order_id     text,
  pancake_sync_status  text not null default 'pending'
                         check (pancake_sync_status in ('pending','disabled','synced','failed')),
  pancake_sync_error   text,
  idempotency_key      text not null unique,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Tra cứu đơn theo mã (trang /order/:orderCode và /order-tracking).
create index if not exists orders_order_code_idx on public.orders (order_code);
-- Tìm đơn theo số điện thoại khách khi shop hỗ trợ qua chat.
create index if not exists orders_customer_phone_idx on public.orders (customer_phone);
-- Lọc bảng điều hành theo trạng thái + thời gian.
create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
-- Tìm nhanh các đơn cần đồng bộ lại sang Pancake.
create index if not exists orders_sync_failed_idx on public.orders (pancake_sync_status)
  where pancake_sync_status in ('failed', 'pending');
-- Đối chiếu ngược từ Pancake về website khi nhận webhook.
create index if not exists orders_pancake_order_id_idx on public.orders (pancake_order_id)
  where pancake_order_id is not null;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- =====================================================================
-- BẢNG: order_items
-- custom_data giữ nguyên JSON thiết kế của khách — đây là dữ liệu để làm hàng.
-- =====================================================================
create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders (id) on delete cascade,
  product_id       uuid references public.products (id) on delete set null,
  product_slug     text not null,
  product_name     text not null,
  quantity         integer not null default 1 check (quantity > 0),
  unit_price       integer not null check (unit_price >= 0),
  custom_data      jsonb not null default '{}'::jsonb,
  preview_url      text,
  production_note  text,
  created_at       timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_slug_idx on public.order_items (product_slug);

-- =====================================================================
-- BẢNG: order_events (nhật ký trạng thái + webhook)
-- =====================================================================
create table if not exists public.order_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  event_type  text not null,
  old_status  text,
  new_status  text,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists order_events_order_id_idx on public.order_events (order_id, created_at);
create index if not exists order_events_type_idx on public.order_events (event_type);
-- Hỗ trợ truy vấn chống trùng webhook: payload @> '{"eventId": "..."}'
create index if not exists order_events_payload_idx on public.order_events using gin (payload);

-- =====================================================================
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
-- Nguyên tắc: anon key (trình duyệt) KHÔNG đọc được đơn hàng.
-- Netlify Functions dùng service role key nên bỏ qua RLS.
-- Khách chỉ tra đơn qua function get-order (cần mã đơn + số điện thoại).
-- =====================================================================

alter table public.products        enable row level security;
alter table public.product_options enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.order_events    enable row level security;

-- Sản phẩm đang bán thì ai xem cũng được (dữ liệu công khai, không nhạy cảm).
drop policy if exists "public read active products" on public.products;
create policy "public read active products"
  on public.products for select
  to anon, authenticated
  using (active = true);

drop policy if exists "public read options of active products" on public.product_options;
create policy "public read options of active products"
  on public.product_options for select
  to anon, authenticated
  using (
    exists (select 1 from public.products p where p.id = product_id and p.active = true)
  );

-- orders / order_items / order_events: KHÔNG có policy nào cho anon.
-- RLS bật + không policy = mọi truy cập từ trình duyệt đều bị từ chối.
-- Đây là chủ ý, không phải thiếu sót.

-- =====================================================================
-- STORAGE: bucket chứa ảnh preview thiết kế
-- ---------------------------------------------------------------------
-- Public read để khách mở link xem lại thiết kế.
-- Ghi vào bucket CHỈ qua Netlify Function (service role key).
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('order-previews', 'order-previews', true)
on conflict (id) do nothing;

-- Nếu bucket đã tồn tại từ bản cũ, đảm bảo nó được chuyển sang Public.
update storage.buckets
set public = true
where id = 'order-previews';

drop policy if exists "public read order previews" on storage.objects;
create policy "public read order previews"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'order-previews');

-- Không tạo policy INSERT/UPDATE cho anon: trình duyệt không được upload.

-- =====================================================================
-- DỮ LIỆU MẪU (tuỳ chọn)
-- Giữ bảng products khớp với file cấu hình trong code.
-- =====================================================================
insert into public.products (name, slug, description, template_type, base_price, thumbnail_url, active)
values (
  'Custom Clicker Raccoonie',
  'custom-clicker',
  'Khay clicker custom theo yêu cầu, chọn số phím, bộ màu, nội dung và loại switch.',
  'clicker',
  79000,
  '/products/custom-clicker/clicker-1.svg',
  true
)
on conflict (slug) do nothing;
