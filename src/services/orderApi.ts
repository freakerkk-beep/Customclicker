import type { ClickerCustomData, CustomerInput } from '../../shared/orderSchema';
import type { CreateOrderSuccess, GetOrderSuccess, OrderView } from '../types/order';

/**
 * Lớp gọi backend. Frontend KHÔNG bao giờ gọi thẳng Supabase hay Pancake —
 * mọi thứ đi qua Netlify Functions để secret không lộ ra trình duyệt.
 */

const BASE = '/.netlify/functions';
const TIMEOUT_MS = 20_000;

/** Lỗi có thông tin đủ để hiển thị cho khách và tô đỏ từng ô nhập. */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorShape {
  ok: false;
  error: { code: string; message: string; fields?: Record<string, string> };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });

    let body: unknown = null;
    try {
      body = (await response.json()) as unknown;
    } catch {
      throw new ApiError('BAD_RESPONSE', 'Máy chủ trả về dữ liệu không đọc được.', undefined, response.status);
    }

    if (!response.ok || (body as { ok?: boolean }).ok === false) {
      const shape = body as ErrorShape;
      throw new ApiError(
        shape.error?.code ?? 'UNKNOWN',
        shape.error?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.',
        shape.error?.fields,
        response.status,
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'Máy chủ phản hồi quá lâu. Vui lòng kiểm tra mạng và thử lại.');
    }
    throw new ApiError('NETWORK_ERROR', 'Không kết nối được tới máy chủ. Kiểm tra mạng giúp mình nhé.');
  } finally {
    window.clearTimeout(timer);
  }
}

export interface CreateOrderPayload {
  productSlug: string;
  quantity: number;
  customData: ClickerCustomData;
  customer: Omit<CustomerInput, 'note'> & { note?: string };
  designConfirmed: true;
  idempotencyKey: string;
  previewImageBase64?: string;
  website?: string;
  /** Giá đang hiển thị — server chỉ dùng để đối chiếu log, không dùng để tính tiền. */
  clientQuotedUnitPrice?: number;
}

export function createOrder(payload: CreateOrderPayload): Promise<CreateOrderSuccess> {
  return request<CreateOrderSuccess>(`${BASE}/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getOrder(orderCode: string, phone: string): Promise<OrderView> {
  const params = new URLSearchParams({ orderCode, phone });
  const result = await request<GetOrderSuccess>(`${BASE}/get-order?${params.toString()}`);
  return result.order;
}
