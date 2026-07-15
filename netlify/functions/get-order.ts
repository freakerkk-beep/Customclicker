import type { Handler } from '@netlify/functions';
import { ZodError } from 'zod';
import { getOrderQuerySchema } from '../../shared/orderSchema';
import { fail, getClientIp, json, methodNotAllowed, ok, zodFieldErrors } from './lib/http';
import { getServiceClient } from './lib/supabase';
import { checkRateLimit, sweepRateLimit } from './lib/rateLimit';

/**
 * GET /.netlify/functions/get-order?orderCode=RAC-260715-A8F2&phone=0912345678
 *
 * Khách chỉ tra được đơn khi có ĐỦ mã đơn VÀ số điện thoại đặt hàng.
 * Frontend không có quyền đọc bảng orders (RLS chặn) — mọi truy vấn đi qua
 * function này để không lộ dữ liệu của đơn khác.
 */

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed('GET');

  sweepRateLimit();
  const ip = getClientIp(event);
  const limit = checkRateLimit(`get-order:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!limit.allowed) {
    return json(429, {
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: `Bạn tra cứu hơi nhanh. Vui lòng thử lại sau ${limit.retryAfterSeconds} giây.`,
      },
    });
  }

  let query;
  try {
    query = getOrderQuerySchema.parse({
      orderCode: event.queryStringParameters?.orderCode ?? '',
      phone: event.queryStringParameters?.phone ?? '',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(400, 'VALIDATION_ERROR', 'Thông tin tra cứu chưa hợp lệ.', zodFieldErrors(error.issues));
    }
    return fail(400, 'VALIDATION_ERROR', 'Thông tin tra cứu chưa hợp lệ.');
  }

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      order_code, status, created_at, customer_name, customer_phone,
      province, district, ward, address_detail,
      subtotal, shipping_fee, total, pancake_sync_status,
      order_items ( product_name, product_slug, quantity, unit_price, custom_data, preview_url ),
      order_events ( event_type, new_status, created_at )
    `,
    )
    .eq('order_code', query.orderCode)
    .maybeSingle();

  if (error) {
    console.error('[get-order] Lỗi truy vấn:', error.message);
    return fail(500, 'DB_ERROR', 'Không tra cứu được đơn hàng. Vui lòng thử lại.');
  }

  // Sai mã HOẶC sai số điện thoại đều trả về cùng một thông báo,
  // để không ai dò được mã đơn nào có thật.
  if (!data || data.customer_phone !== query.phone) {
    return fail(404, 'ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại này.');
  }

  const items = (data.order_items ?? []) as Array<Record<string, unknown>>;
  const events = (data.order_events ?? []) as Array<Record<string, unknown>>;

  return ok({
    order: {
      orderCode: data.order_code,
      status: data.status,
      createdAt: data.created_at,
      // Che bớt tên để ảnh chụp màn hình chia sẻ không lộ danh tính đầy đủ.
      customerName: data.customer_name,
      province: data.province,
      district: data.district,
      ward: data.ward,
      addressDetail: data.address_detail,
      subtotal: data.subtotal,
      shippingFee: data.shipping_fee,
      total: data.total,
      pancakeSyncStatus: data.pancake_sync_status,
      items: items.map((item) => ({
        productName: item.product_name,
        productSlug: item.product_slug,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        customData: item.custom_data,
        previewUrl: item.preview_url ?? null,
      })),
      events: events
        .map((e) => ({
          eventType: e.event_type,
          newStatus: e.new_status ?? null,
          createdAt: e.created_at,
        }))
        .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))),
    },
  });
};
