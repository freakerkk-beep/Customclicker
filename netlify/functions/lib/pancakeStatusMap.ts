import type { OrderStatus } from '../../../shared/constants';

/**
 * ÁNH XẠ TRẠNG THÁI PANCAKE -> TRẠNG THÁI NỘI BỘ.
 *
 * ⚠️ CẦN ĐỐI CHIẾU TÀI LIỆU PANCAKE CỦA SHOP BẠN.
 * Pancake POS trả trạng thái đơn dưới dạng số (hoặc chuỗi, tuỳ phiên bản API).
 * Bảng dưới đây là ánh xạ MẶC ĐỊNH theo bộ trạng thái phổ biến của Pancake POS.
 * Hãy mở một đơn thật trên Pancake, xem giá trị `status` mà webhook gửi về
 * (function pancake-webhook đã ghi log payload), rồi sửa lại bảng này cho khớp.
 */
export const PANCAKE_STATUS_TO_INTERNAL: Record<string, OrderStatus> = {
  // Giá trị số (Pancake POS thường dùng)
  '0': 'new', // Mới
  '1': 'confirmed', // Đã xác nhận
  '2': 'in_production', // Đang xử lý / đóng gói
  '3': 'shipping', // Đã gửi hàng
  '4': 'completed', // Đã nhận / hoàn thành
  '5': 'cancelled', // Huỷ
  '6': 'ready_to_ship', // Chờ chuyển hàng
  '11': 'paid', // Đã thanh toán

  // Giá trị chuỗi (một số cấu hình dùng key dạng text)
  new: 'new',
  confirmed: 'confirmed',
  paid: 'paid',
  processing: 'in_production',
  packing: 'in_production',
  ready_to_ship: 'ready_to_ship',
  shipping: 'shipping',
  shipped: 'shipping',
  delivered: 'completed',
  completed: 'completed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
};

/** Trả về trạng thái nội bộ, hoặc null nếu không nhận diện được. */
export function mapPancakeStatus(raw: unknown): OrderStatus | null {
  if (raw === null || raw === undefined) return null;
  const key = String(raw).trim().toLowerCase();
  return PANCAKE_STATUS_TO_INTERNAL[key] ?? null;
}
