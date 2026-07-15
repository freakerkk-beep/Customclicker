/**
 * Cổng vào logic giá cho frontend.
 * Toàn bộ công thức nằm ở `shared/pricing.ts` để backend dùng chung
 * đúng một nguồn — không được tính giá ở nơi khác.
 */
export {
  CLICKER_PRICING,
  PriceValidationError,
  buildPriceTable,
  calculateProductPrice,
  safeCalculateProductPrice,
} from '../../shared/pricing';
export type { PricingConfig } from '../../shared/pricing';

import { calculateProductPrice } from '../../shared/pricing';
import type { PricingConfig } from '../../shared/pricing';

/** Đơn giá × số lượng. Backend vẫn tính lại con số này khi tạo đơn. */
export function calculateSubtotal(
  characterCount: number,
  quantity: number,
  pricing: PricingConfig,
): number {
  return calculateProductPrice(characterCount, pricing) * quantity;
}
