import type { Handler } from '@netlify/functions';
import { fail, methodNotAllowed, ok } from './lib/http';
import { verifyPancakeWebhook } from './lib/pancake';
import { mapPancakeStatus } from './lib/pancakeStatusMap';
import { getServiceClient } from './lib/supabase';

/**
 * POST /.netlify/functions/pancake-webhook
 *
 * Nhận cập nhật trạng thái từ Pancake.
 *
 * Nguyên tắc:
 *  - Payload chưa xác thực chữ ký => từ chối (401), không đụng vào database.
 *  - Ghi log mọi sự kiện vào order_events.
 *  - Không tạo event trùng (cùng đơn + cùng trạng thái + cùng event id).
 *  - Trả HTTP status phù hợp để Pancake biết có cần gửi lại không.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed('POST');

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
    : (event.body ?? '');

  // --- Xác thực chữ ký -----------------------------------------------------
  if (!verifyPancakeWebhook(rawBody, event.headers as Record<string, string>)) {
    console.warn('[pancake-webhook] Từ chối webhook: chữ ký không hợp lệ hoặc thiếu secret.');
    return fail(401, 'INVALID_SIGNATURE', 'Chữ ký webhook không hợp lệ.');
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    // 400: payload hỏng, gửi lại cũng vô ích.
    return fail(400, 'INVALID_JSON', 'Payload không phải JSON hợp lệ.');
  }

  // ⚠️ [CẦN ĐỐI CHIẾU TÀI LIỆU PANCAKE]
  // Vị trí các field dưới đây tuỳ phiên bản webhook. Log bên dưới in ra toàn bộ
  // key của payload để bạn xem trên Netlify Functions log rồi chỉnh cho khớp.
  console.warn('[pancake-webhook] Các key nhận được:', Object.keys(payload).join(', '));

  const data = (payload.data as Record<string, unknown> | undefined) ?? payload;

  const referenceCode =
    (data.reference_code as string | undefined) ??
    (data.order_code as string | undefined) ??
    (payload.reference_code as string | undefined);

  const pancakeOrderId =
    (data.id as string | number | undefined) ?? (data.order_id as string | number | undefined);

  const rawStatus = data.status ?? data.order_status ?? payload.status;
  const newStatus = mapPancakeStatus(rawStatus);
  const eventId = (payload.event_id as string | undefined) ?? (payload.id as string | undefined);

  if (!referenceCode && !pancakeOrderId) {
    return fail(400, 'MISSING_ORDER_REFERENCE', 'Webhook không chứa mã đơn để đối chiếu.');
  }

  const supabase = getServiceClient();

  // --- Tìm đơn tương ứng ---------------------------------------------------
  const lookup = supabase.from('orders').select('id, order_code, status');
  const { data: order, error: lookupError } = referenceCode
    ? await lookup.eq('order_code', referenceCode).maybeSingle()
    : await lookup.eq('pancake_order_id', String(pancakeOrderId)).maybeSingle();

  if (lookupError) {
    console.error('[pancake-webhook] Lỗi tra đơn:', lookupError.message);
    // 500 để Pancake thử gửi lại sau.
    return fail(500, 'DB_ERROR', 'Lỗi truy vấn đơn hàng.');
  }

  if (!order) {
    // 200 để Pancake không gửi lại mãi một đơn không thuộc website này.
    console.warn(`[pancake-webhook] Không tìm thấy đơn cho reference ${referenceCode ?? pancakeOrderId}.`);
    return ok({ ignored: true, reason: 'ORDER_NOT_FOUND' });
  }

  const orderId = order.id as string;
  const oldStatus = order.status as string;

  // --- Chống trùng event ---------------------------------------------------
  if (eventId) {
    const { data: duplicate } = await supabase
      .from('order_events')
      .select('id')
      .eq('order_id', orderId)
      .eq('event_type', 'pancake_webhook')
      .contains('payload', { eventId })
      .maybeSingle();

    if (duplicate) {
      return ok({ duplicate: true, orderCode: order.order_code });
    }
  }

  if (!newStatus) {
    // Nhận được nhưng chưa map được trạng thái: vẫn ghi log để còn sửa map.
    await supabase.from('order_events').insert({
      order_id: orderId,
      event_type: 'pancake_webhook',
      old_status: oldStatus,
      new_status: null,
      payload: { eventId, rawStatus, unmapped: true },
    });
    console.warn(`[pancake-webhook] Trạng thái Pancake chưa được map: ${String(rawStatus)}`);
    return ok({ orderCode: order.order_code, statusChanged: false, unmappedStatus: true });
  }

  // --- Cập nhật trạng thái -------------------------------------------------
  if (newStatus !== oldStatus) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (updateError) {
      console.error('[pancake-webhook] Lỗi cập nhật trạng thái:', updateError.message);
      return fail(500, 'DB_ERROR', 'Không cập nhật được trạng thái đơn.');
    }
  }

  await supabase.from('order_events').insert({
    order_id: orderId,
    event_type: 'pancake_webhook',
    old_status: oldStatus,
    new_status: newStatus,
    payload: { eventId, rawStatus },
  });

  return ok({ orderCode: order.order_code, statusChanged: newStatus !== oldStatus, status: newStatus });
};
