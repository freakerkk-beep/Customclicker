-- Chạy file này một lần trong Supabase SQL Editor nếu bucket order-previews
-- đã được tạo trước đây nhưng chưa ở chế độ Public.

update storage.buckets
set public = true
where id = 'order-previews';

-- Cho phép mở ảnh bằng public URL. Việc upload vẫn chỉ thực hiện từ
-- Netlify Function bằng SUPABASE_SERVICE_ROLE_KEY.
drop policy if exists "public read order previews" on storage.objects;
create policy "public read order previews"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'order-previews');
