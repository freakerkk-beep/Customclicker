/** Giới hạn dùng chung giữa frontend và backend. */
export const LIMITS = {
  /**
   * Mỗi phím chỉ được 1 ký tự duy nhất.
   * Chữ cái sẽ tự động chuyển thành IN HOA trước khi lưu.
   */
  keyTextMaxLength: 1,
  customerNameMin: 2,
  customerNameMax: 80,
  addressMax: 200,
  noteMax: 500,
  quantityMin: 1,
  quantityMax: 20,
  /** Ảnh preview base64 tối đa ~2MB chuỗi. Vượt quá thì bỏ ảnh, đơn vẫn được tạo. */
  previewImageMaxChars: 2_000_000,
} as const;

/** Trạng thái nội bộ của đơn hàng. */
export const ORDER_STATUSES = [
  'new',
  'confirmed',
  'paid',
  'in_production',
  'ready_to_ship',
  'shipping',
  'completed',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Nhãn tiếng Việt hiển thị cho khách. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Đơn mới',
  confirmed: 'Đã xác nhận',
  paid: 'Đã thanh toán',
  in_production: 'Đang sản xuất',
  ready_to_ship: 'Chờ gửi hàng',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

/** Mô tả ngắn cho timeline tra cứu đơn. */
export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  new: 'Raccoonie đã nhận đơn và sẽ liên hệ xác nhận.',
  confirmed: 'Đơn đã được xác nhận, chuẩn bị vào xưởng.',
  paid: 'Shop đã nhận được thanh toán.',
  in_production: 'Clicker của bạn đang được làm thủ công.',
  ready_to_ship: 'Hàng đã xong, chờ bàn giao đơn vị vận chuyển.',
  shipping: 'Đơn đang trên đường tới bạn.',
  completed: 'Đơn đã giao thành công. Cảm ơn bạn!',
  cancelled: 'Đơn đã được huỷ.',
};

/** Thứ tự các bước hiển thị trên timeline (không gồm trạng thái huỷ). */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'new',
  'confirmed',
  'in_production',
  'ready_to_ship',
  'shipping',
  'completed',
];

/** Trạng thái đồng bộ Pancake. */
export const PANCAKE_SYNC_STATUSES = ['pending', 'disabled', 'synced', 'failed'] as const;
export type PancakeSyncStatus = (typeof PANCAKE_SYNC_STATUSES)[number];

export const PANCAKE_SYNC_LABELS: Record<PancakeSyncStatus, string> = {
  pending: 'Đang chờ đồng bộ',
  disabled: 'Không đồng bộ',
  synced: 'Đã đồng bộ',
  failed: 'Chờ đồng bộ lại',
};
