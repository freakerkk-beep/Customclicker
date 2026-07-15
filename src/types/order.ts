import type { OrderStatus, PancakeSyncStatus } from '../../shared/constants';
import type { ClickerCustomData, CustomerInput } from '../../shared/orderSchema';

export type { ClickerCustomData, CustomerInput };

export interface CreateOrderSuccess {
  ok: true;
  orderCode: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  unitPrice: number;
  quantity: number;
  pancakeSyncStatus: PancakeSyncStatus;
  /** true khi đơn đã lưu nhưng Pancake chưa đồng bộ được. */
  pancakePending: boolean;
}

export interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
    /** Lỗi theo từng trường, key là tên field. */
    fields?: Record<string, string>;
  };
}

export interface OrderEventView {
  eventType: string;
  newStatus: OrderStatus | null;
  createdAt: string;
}

export interface OrderItemView {
  productName: string;
  productSlug: string;
  quantity: number;
  unitPrice: number;
  customData: ClickerCustomData;
  previewUrl: string | null;
}

export interface OrderView {
  orderCode: string;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  subtotal: number;
  shippingFee: number | null;
  total: number;
  pancakeSyncStatus: PancakeSyncStatus;
  items: OrderItemView[];
  events: OrderEventView[];
}

export interface GetOrderSuccess {
  ok: true;
  order: OrderView;
}
