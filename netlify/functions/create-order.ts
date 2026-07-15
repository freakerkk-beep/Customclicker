import type { Handler } from '@netlify/functions';
import { ZodError } from 'zod';
import { createOrderRequestSchema } from '../../shared/orderSchema';
import { getProductBySlug } from '../../src/products/productRegistry';
import {
  BusinessError,
  buildKeyLabels,
  priceOrder,
  validateCustomDataAgainstProduct,
} from './lib/orderBuilder';
import {
  fail,
  getClientIp,
  json,
  methodNotAllowed,
  ok,
  parseJsonBody,
  zodFieldErrors,
} from './lib/http';
import { generateOrderCode } from './lib/orderCode';
import { createPancakeOrder, isPancakeSyncEnabled } from './lib/pancake';
import { PG_UNIQUE_VIOLATION, PREVIEW_BUCKET, getServiceClient } from './lib/supabase';
import { checkRateLimit, sweepRateLimit } from './lib/rateLimit';

/**
 * POST /.netlify/functions/create-order
 *
 * Thứ tự xử lý (không được đổi):
 *  1. Validate body bằng Zod       6. Sinh mã đơn ở backend
 *  2. Chuẩn hoá số điện thoại      7. Lưu đơn vào Supabase
 *  3. Kiểm tra idempotency key     8. Lưu order item + custom_data
 *  4. Tính lại giá ở server        9. Gửi sang Pancake
 *  5. Bỏ qua giá frontend gửi     10. Cập nhật pancake_order_id
 *                                 11. Trả kết quả
 *
 * NGUYÊN TẮC: Supabase lưu được đơn = đơn đã tồn tại. Pancake lỗi thì
 * đánh dấu chờ đồng bộ, TUYỆT ĐỐI không làm mất đơn của khách.
 */

const RATE_LIMIT_MAX = 8; // tối đa 8 đơn / IP
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // trong 10 phút

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed('POST');

  // --- Rate limit cơ bản theo IP -------------------------------------------
  sweepRateLimit();
  const ip = getClientIp(event);
  const limit = checkRateLimit(`create-order:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!limit.allowed) {
    return json(429, {
      ok: false,
      error: {
        code: 'RATE_LIMITED',
        message: `Bạn vừa gửi quá nhiều đơn. Vui lòng thử lại sau ${limit.retryAfterSeconds} giây.`,
      },
    });
  }

  // --- 1. Đọc và validate body ---------------------------------------------
  let raw: unknown;
  try {
    raw = parseJsonBody(event);
  } catch {
    return fail(400, 'INVALID_JSON', 'Dữ liệu gửi lên không đọc được.');
  }

  let input;
  try {
    // Zod đồng thời chuẩn hoá số điện thoại và làm sạch text (bước 2).
    input = createOrderRequestSchema.parse(raw);
  } catch (error) {
    if (error instanceof ZodError) {
      return fail(400, 'VALIDATION_ERROR', 'Dữ liệu chưa hợp lệ.', zodFieldErrors(error.issues));
    }
    return fail(400, 'VALIDATION_ERROR', 'Dữ liệu chưa hợp lệ.');
  }

  // --- Honeypot: bot điền, người thật thì không -----------------------------
  if (input.website && input.website.length > 0) {
    // Không nói rõ lý do để bot không học được.
    return fail(400, 'INVALID_REQUEST', 'Không thể tạo đơn hàng.');
  }

  const product = getProductBySlug(input.productSlug);
  if (!product) {
    return fail(404, 'PRODUCT_NOT_FOUND', 'Sản phẩm không tồn tại hoặc đã ngừng bán.');
  }

  const supabase = getServiceClient();

  try {
    validateCustomDataAgainstProduct(input.customData, product);
  } catch (error) {
    if (error instanceof BusinessError) {
      return fail(400, error.code, error.message, error.fields);
    }
    throw error;
  }

  // --- 3. Idempotency: cùng key -> trả lại đúng đơn cũ, không tạo đơn mới ---
  const { data: existing, error: existingError } = await supabase
    .from('orders')
    .select('order_code, status, subtotal, total, pancake_sync_status')
    .eq('idempotency_key', input.idempotencyKey)
    .maybeSingle();

  if (existingError) {
    console.error('[create-order] Lỗi khi kiểm tra idempotency:', existingError.message);
    return fail(500, 'DB_ERROR', 'Không kiểm tra được đơn hàng. Vui lòng thử lại.');
  }

  if (existing) {
    const pricing = priceOrder(input.customData, product, input.quantity);
    return ok({
      orderCode: existing.order_code as string,
      status: existing.status as string,
      subtotal: existing.subtotal as number,
      total: existing.total as number,
      unitPrice: pricing.unitPrice,
      quantity: input.quantity,
      pancakeSyncStatus: existing.pancake_sync_status as string,
      pancakePending: existing.pancake_sync_status === 'failed' || existing.pancake_sync_status === 'pending',
      duplicate: true,
    });
  }

  // --- 4 & 5. Tính lại giá ở server, KHÔNG dùng giá frontend gửi lên --------
  const pricing = priceOrder(input.customData, product, input.quantity);

  if (
    input.clientQuotedUnitPrice !== undefined &&
    input.clientQuotedUnitPrice !== pricing.unitPrice
  ) {
    // Chỉ ghi log để phát hiện lệch phiên bản bảng giá — không lộ thông tin khách.
    console.warn(
      `[create-order] Giá frontend (${input.clientQuotedUnitPrice}) lệch giá server (${pricing.unitPrice}) cho ${input.customData.characterCount} ký tự.`,
    );
  }

  const initialSyncStatus = isPancakeSyncEnabled() ? 'pending' : 'disabled';

  // --- 6 & 7. Sinh mã đơn + lưu đơn (retry nếu trùng mã) --------------------
  let orderId: string | null = null;
  let orderCode = '';

  for (let attempt = 0; attempt < 5; attempt += 1) {
    orderCode = generateOrderCode();
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        customer_name: input.customer.fullName,
        customer_phone: input.customer.phone,
        customer_email: input.customer.email ?? null,
        province: input.customer.province,
        district: input.customer.district,
        ward: input.customer.ward,
        address_detail: input.customer.addressDetail,
        customer_note: input.customer.note ?? null,
        subtotal: pricing.subtotal,
        shipping_fee: pricing.shippingFee,
        total: pricing.total,
        status: 'new',
        pancake_sync_status: initialSyncStatus,
        idempotency_key: input.idempotencyKey,
      })
      .select('id, order_code')
      .single();

    if (!error && data) {
      orderId = data.id as string;
      orderCode = data.order_code as string;
      break;
    }

    if (error?.code === PG_UNIQUE_VIOLATION) {
      // Trùng idempotency_key: một request song song đã tạo đơn trước.
      if (error.message.includes('idempotency_key')) {
        const { data: race } = await supabase
          .from('orders')
          .select('order_code, status, subtotal, total, pancake_sync_status')
          .eq('idempotency_key', input.idempotencyKey)
          .maybeSingle();
        if (race) {
          return ok({
            orderCode: race.order_code as string,
            status: race.status as string,
            subtotal: race.subtotal as number,
            total: race.total as number,
            unitPrice: pricing.unitPrice,
            quantity: input.quantity,
            pancakeSyncStatus: race.pancake_sync_status as string,
            pancakePending: race.pancake_sync_status !== 'synced',
            duplicate: true,
          });
        }
      }
      // Trùng order_code: sinh mã khác rồi thử lại.
      continue;
    }

    console.error('[create-order] Lỗi khi lưu đơn:', error?.message);
    return fail(500, 'DB_ERROR', 'Không lưu được đơn hàng. Vui lòng thử lại.');
  }

  if (!orderId) {
    return fail(500, 'ORDER_CODE_CONFLICT', 'Không tạo được mã đơn. Vui lòng thử lại.');
  }

  // --- 8. Lưu order item + custom_data -------------------------------------
  const { error: itemError } = await supabase.from('order_items').insert({
    order_id: orderId,
    product_slug: product.slug,
    product_name: product.name,
    quantity: input.quantity,
    unit_price: pricing.unitPrice,
    custom_data: input.customData,
    production_note: null,
  });

  if (itemError) {
    console.error('[create-order] Lỗi khi lưu order item:', itemError.message);
    // Đơn đã tồn tại nhưng thiếu chi tiết -> đánh dấu để shop xử lý tay.
    await supabase.from('order_events').insert({
      order_id: orderId,
      event_type: 'order_item_failed',
      payload: { message: itemError.message },
    });
    return fail(500, 'DB_ERROR', 'Không lưu được chi tiết đơn hàng. Vui lòng liên hệ shop.');
  }

  await supabase.from('order_events').insert({
    order_id: orderId,
    event_type: 'order_created',
    old_status: null,
    new_status: 'new',
    payload: { source: 'website', characterCount: input.customData.characterCount },
  });

  // --- Ảnh preview (tuỳ chọn): lỗi thì bỏ qua, đơn vẫn giữ nguyên ----------
  let previewUrl: string | null = null;
  if (input.previewImageBase64) {
    previewUrl = await uploadPreview(orderCode, input.previewImageBase64);
    if (previewUrl) {
      await supabase.from('order_items').update({ preview_url: previewUrl }).eq('order_id', orderId);
    }
  }

  // --- 9 & 10. Đồng bộ Pancake ---------------------------------------------
  const palette = product.palettes.find((p) => p.id === input.customData.colorPaletteId);
  const siteUrl = (process.env.VITE_SITE_URL ?? process.env.URL ?? '').replace(/\/$/, '');

  const syncResult = await createPancakeOrder({
    orderCode,
    product,
    customer: input.customer,
    customData: input.customData,
    palette,
    quantity: input.quantity,
    unitPrice: pricing.unitPrice,
    subtotal: pricing.subtotal,
    orderDetailUrl: `${siteUrl}/order/${orderCode}`,
    keyLabels: buildKeyLabels(input.customData),
  });

  await supabase
    .from('orders')
    .update({
      pancake_order_id: syncResult.pancakeOrderId,
      pancake_sync_status: syncResult.status,
      pancake_sync_error: syncResult.error,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (syncResult.status === 'failed') {
    console.error(`[create-order] Pancake sync thất bại cho ${orderCode}: ${syncResult.error}`);
    await supabase.from('order_events').insert({
      order_id: orderId,
      event_type: 'pancake_sync_failed',
      payload: { error: syncResult.error },
    });
  } else if (syncResult.status === 'synced') {
    await supabase.from('order_events').insert({
      order_id: orderId,
      event_type: 'pancake_synced',
      payload: { pancakeOrderId: syncResult.pancakeOrderId },
    });
  }

  // --- 11. Trả kết quả ------------------------------------------------------
  return ok({
    orderCode,
    status: 'new',
    subtotal: pricing.subtotal,
    total: pricing.total,
    unitPrice: pricing.unitPrice,
    quantity: input.quantity,
    pancakeSyncStatus: syncResult.status,
    pancakePending: syncResult.status === 'failed',
  });
};

/**
 * Upload ảnh preview lên Supabase Storage bằng service role key.
 * Trình duyệt KHÔNG được ghi thẳng vào storage.
 * Lỗi upload không bao giờ làm hỏng đơn — chỉ trả về null.
 */
async function uploadPreview(orderCode: string, dataUrl: string): Promise<string | null> {
  try {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return null;

    const buffer = Buffer.from(base64, 'base64');
    const supabase = getServiceClient();
    const path = `${orderCode}.png`;

    const { error } = await supabase.storage.from(PREVIEW_BUCKET).upload(path, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

    if (error) {
      console.error('[create-order] Upload preview lỗi:', error.message);
      return null;
    }

    const { data } = supabase.storage.from(PREVIEW_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('[create-order] Upload preview lỗi:', error instanceof Error ? error.message : error);
    return null;
  }
}
