import { createHmac, timingSafeEqual } from 'node:crypto';
import { formatVnd } from '../../../shared/currency';
import type { ClickerCustomData, CustomerInput } from '../../../shared/orderSchema';
import type { ColorPalette, ProductConfig } from '../../../src/types/product';
import { envFlag } from './http';

/**
 * ADAPTER PANCAKE
 * ================================================================
 * Toàn bộ việc gọi Pancake nằm trong file này. API key CHỈ tồn tại ở đây
 * (server-side) — trình duyệt không bao giờ gọi thẳng Pancake.
 *
 * ⚠️ QUAN TRỌNG — ĐỌC TRƯỚC KHI BẬT SYNC:
 * Endpoint và cấu trúc payload của Pancake khác nhau tuỳ tài khoản, gói dịch vụ
 * và phiên bản API. Mình KHÔNG bịa ra field không có thật. Ba chỗ bên dưới được
 * đánh dấu [CẦN CHỈNH THEO TÀI LIỆU PANCAKE] — hãy mở tài liệu API của shop bạn
 * (Pancake POS: Cấu hình → API, hoặc liên hệ hỗ trợ Pancake để lấy doc) rồi sửa:
 *
 *   1. PANCAKE_ORDER_ENDPOINT  — đường dẫn tạo đơn.
 *   2. mapOrderToPancakePayload() — tên các field trong payload.
 *   3. extractPancakeOrderId()  — vị trí ID đơn trong response.
 *
 * Trong lúc chưa có thông tin chính xác, hãy để PANCAKE_SYNC_ENABLED=false.
 * Website vẫn tạo đơn bình thường trong Supabase và đánh dấu chờ đồng bộ.
 */

/** Thời gian chờ tối đa khi gọi Pancake (ms). Quá hạn thì coi như lỗi sync. */
const PANCAKE_TIMEOUT_MS = 10_000;

export interface PancakeOrderContext {
  orderCode: string;
  product: ProductConfig;
  customer: CustomerInput;
  customData: ClickerCustomData;
  palette: ColorPalette | undefined;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  orderDetailUrl: string;
  /** Nội dung từng phím đã render sẵn thành text: ["A", "B", "HEART", ...] */
  keyLabels: string[];
}

export interface PancakeSyncResult {
  status: 'synced' | 'failed' | 'disabled';
  pancakeOrderId: string | null;
  error: string | null;
}

/** Payload gửi sang Pancake. Kiểu mở để dễ thêm field theo tài liệu thật. */
export interface PancakeOrderPayload {
  shop_id: string;
  warehouse_id?: string;
  bill_full_name: string;
  bill_phone_number: string;
  bill_email?: string;
  shipping_address: {
    full_name: string;
    phone_number: string;
    province_name: string;
    district_name: string;
    commune_name: string;
    address: string;
    full_address: string;
  };
  items: Array<{
    product_id?: string;
    variant_id?: string;
    quantity: number;
    retail_price: number;
    note?: string;
  }>;
  note: string;
  total_discount: number;
  /** Mã đơn của website, để đối soát hai chiều. */
  reference_code: string;
  [key: string]: unknown;
}

export function isPancakeSyncEnabled(): boolean {
  return envFlag('PANCAKE_SYNC_ENABLED', false);
}

/**
 * Ghi chú đơn hàng — đây là thứ nhân viên xưởng đọc để làm sản phẩm,
 * nên phải rõ ràng và đầy đủ.
 */
export function buildPancakeNote(ctx: PancakeOrderContext): string {
  const lines: string[] = [
    `Mã đơn: ${ctx.orderCode}`,
    `Sản phẩm: ${ctx.product.name}`,
    `Số ký tự: ${ctx.customData.characterCount}`,
    `Bộ màu: ${ctx.palette?.name ?? ctx.customData.colorPaletteId}`,
    `Switch: ${ctx.customData.switchType === 'clicky' ? 'Clicky' : 'Smooth'}`,
    '',
  ];

  ctx.keyLabels.forEach((label, index) => {
    lines.push(`Phím ${index + 1}: ${label}`);
  });

  lines.push('');
  if (ctx.quantity > 1) {
    lines.push(`Số lượng: ${ctx.quantity} x ${formatVnd(ctx.unitPrice)}`);
  }
  lines.push(`Tổng tiền sản phẩm: ${formatVnd(ctx.subtotal)}`);

  if (ctx.customer.note) {
    lines.push('', `Ghi chú của khách: ${ctx.customer.note}`);
  }

  lines.push('', 'Link thiết kế:', ctx.orderDetailUrl);

  return lines.join('\n');
}

/**
 * [CẦN CHỈNH THEO TÀI LIỆU PANCAKE — 2/3]
 * Chuyển đơn của website thành payload Pancake.
 * Tên field bên dưới theo Pancake POS API v1. Nếu tài khoản của bạn dùng tên
 * khác, sửa TẠI ĐÂY — không cần đụng vào create-order.ts.
 */
export function mapOrderToPancakePayload(ctx: PancakeOrderContext): PancakeOrderPayload {
  const { customer } = ctx;
  const fullAddress = [customer.addressDetail, customer.ward, customer.district, customer.province]
    .filter(Boolean)
    .join(', ');

  const productIdKey = ctx.product.pancake?.productIdEnvKey ?? 'PANCAKE_PRODUCT_ID';
  const variantIdKey = ctx.product.pancake?.variantIdEnvKey ?? 'PANCAKE_VARIANT_ID';

  return {
    shop_id: process.env.PANCAKE_SHOP_ID ?? '',
    warehouse_id: process.env.PANCAKE_WAREHOUSE_ID || undefined,
    bill_full_name: customer.fullName,
    bill_phone_number: customer.phone,
    bill_email: customer.email,
    shipping_address: {
      full_name: customer.fullName,
      phone_number: customer.phone,
      province_name: customer.province,
      district_name: customer.district,
      commune_name: customer.ward,
      address: customer.addressDetail,
      full_address: fullAddress,
    },
    items: [
      {
        product_id: process.env[productIdKey] || undefined,
        variant_id: process.env[variantIdKey] || undefined,
        quantity: ctx.quantity,
        retail_price: ctx.unitPrice,
        // Ghi chú theo từng item để nhân viên xưởng thấy ngay nội dung custom.
        note: ctx.keyLabels.map((label, i) => `P${i + 1}:${label}`).join(' | '),
      },
    ],
    note: buildPancakeNote(ctx),
    total_discount: 0,
    reference_code: ctx.orderCode,
  };
}

/**
 * [CẦN CHỈNH THEO TÀI LIỆU PANCAKE — 3/3]
 * Lấy ID đơn Pancake từ response. Các phiên bản API trả về khác nhau
 * (data.id / data.order_id / id), nên thử lần lượt thay vì đoán bừa.
 */
export function extractPancakeOrderId(responseBody: unknown): string | null {
  if (typeof responseBody !== 'object' || responseBody === null) return null;
  const body = responseBody as Record<string, unknown>;

  const candidates: unknown[] = [
    body.id,
    body.order_id,
    (body.data as Record<string, unknown> | undefined)?.id,
    (body.data as Record<string, unknown> | undefined)?.order_id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) return candidate;
    if (typeof candidate === 'number') return String(candidate);
  }
  return null;
}

/**
 * Gọi Pancake tạo đơn.
 * Hàm này KHÔNG BAO GIỜ ném lỗi ra ngoài — Pancake hỏng thì đơn vẫn phải sống
 * trong Supabase. Lỗi được trả về dưới dạng { status: 'failed', error }.
 */
export async function createPancakeOrder(ctx: PancakeOrderContext): Promise<PancakeSyncResult> {
  if (!isPancakeSyncEnabled()) {
    return { status: 'disabled', pancakeOrderId: null, error: null };
  }

  const baseUrl = process.env.PANCAKE_API_BASE_URL;
  const apiKey = process.env.PANCAKE_API_KEY;
  const shopId = process.env.PANCAKE_SHOP_ID;

  if (!baseUrl || !apiKey || !shopId) {
    return {
      status: 'failed',
      pancakeOrderId: null,
      error: 'Thiếu cấu hình Pancake (PANCAKE_API_BASE_URL / PANCAKE_API_KEY / PANCAKE_SHOP_ID).',
    };
  }

  // [CẦN CHỈNH THEO TÀI LIỆU PANCAKE — 1/3]
  // Pancake POS v1 thường dùng: {base}/shops/{shop_id}/orders?api_key={key}
  // Nếu tài khoản của bạn dùng Bearer token hoặc đường dẫn khác, sửa 2 dòng dưới.
  const endpoint = `${baseUrl.replace(/\/$/, '')}/shops/${shopId}/orders?api_key=${encodeURIComponent(apiKey)}`;

  const payload = mapOrderToPancakePayload(ctx);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PANCAKE_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Nếu Pancake của bạn dùng Bearer thay vì api_key trên query string:
        // Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await response.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      return {
        status: 'failed',
        pancakeOrderId: null,
        // Cắt bớt để không ghi log quá dài.
        error: `Pancake trả về HTTP ${response.status}: ${text.slice(0, 500)}`,
      };
    }

    const pancakeOrderId = extractPancakeOrderId(parsed);
    if (!pancakeOrderId) {
      return {
        status: 'failed',
        pancakeOrderId: null,
        error: `Không tìm thấy ID đơn trong response Pancake: ${text.slice(0, 500)}`,
      };
    }

    return { status: 'synced', pancakeOrderId, error: null };
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? `Pancake không phản hồi trong ${PANCAKE_TIMEOUT_MS}ms.`
        : error instanceof Error
          ? error.message
          : 'Lỗi không xác định khi gọi Pancake.';
    return { status: 'failed', pancakeOrderId: null, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Xác thực webhook Pancake bằng HMAC-SHA256 trên raw body.
 *
 * ⚠️ Tên header và thuật toán ký cần đối chiếu tài liệu Pancake của shop bạn.
 * Mặc định hỗ trợ 2 kiểu thường gặp:
 *   - Header chứa HMAC-SHA256 hex của raw body (khuyến nghị).
 *   - Header chứa thẳng secret dùng chung (kém an toàn hơn, chỉ dùng tạm).
 *
 * Nếu chưa cấu hình PANCAKE_WEBHOOK_SECRET, hàm trả về false => webhook bị từ chối.
 * Đây là chủ ý: không tin payload chưa xác thực.
 */
export function verifyPancakeWebhook(rawBody: string, headers: Record<string, string>): boolean {
  const secret = process.env.PANCAKE_WEBHOOK_SECRET;
  if (!secret) return false;

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) normalized[key.toLowerCase()] = value;
  }

  const signature =
    normalized['x-pancake-signature'] ??
    normalized['x-signature'] ??
    normalized['x-hub-signature-256'] ??
    normalized['x-webhook-secret'] ??
    '';

  if (!signature) return false;

  // Kiểu 1: HMAC-SHA256 hex của raw body.
  const expectedHmac = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const provided = signature.replace(/^sha256=/i, '').trim();

  if (safeEqual(provided, expectedHmac)) return true;

  // Kiểu 2: secret dùng chung gửi thẳng trong header.
  return safeEqual(provided, secret);
}

/** So sánh chuỗi chống timing attack. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
