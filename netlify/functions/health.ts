import type { Handler } from '@netlify/functions';
import { envFlag, methodNotAllowed, ok } from './lib/http';

/**
 * GET /.netlify/functions/health
 *
 * Kiểm tra nhanh xem functions có chạy và biến môi trường đã điền đủ chưa.
 * KHÔNG trả về giá trị của bất kỳ secret nào — chỉ báo "đã cấu hình / chưa".
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed('GET');

  const configured = (name: string) => Boolean(process.env[name] && process.env[name]!.trim());

  return ok({
    service: 'raccoonie-custom-clicker',
    time: new Date().toISOString(),
    env: {
      SUPABASE_URL: configured('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: configured('SUPABASE_SERVICE_ROLE_KEY'),
      PANCAKE_SYNC_ENABLED: envFlag('PANCAKE_SYNC_ENABLED', false),
      PANCAKE_API_BASE_URL: configured('PANCAKE_API_BASE_URL'),
      PANCAKE_API_KEY: configured('PANCAKE_API_KEY'),
      PANCAKE_SHOP_ID: configured('PANCAKE_SHOP_ID'),
      PANCAKE_WEBHOOK_SECRET: configured('PANCAKE_WEBHOOK_SECRET'),
    },
  });
};
