import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from './http';

/**
 * Client dùng SERVICE ROLE KEY — chỉ tồn tại trong Netlify Functions.
 * Key này TUYỆT ĐỐI không được đưa ra frontend hay biến VITE_*.
 */
let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'raccoonie-custom-clicker' } },
  });
  return cached;
}

/** Tên bucket chứa ảnh preview thiết kế. */
export const PREVIEW_BUCKET = 'order-previews';

/** Mã lỗi Postgres cho vi phạm ràng buộc unique. */
export const PG_UNIQUE_VIOLATION = '23505';
