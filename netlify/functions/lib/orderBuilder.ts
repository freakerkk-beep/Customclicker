import { calculateProductPrice } from '../../../shared/pricing';
import type { ClickerCustomData } from '../../../shared/orderSchema';
import type { ProductConfig } from '../../../src/types/product';

/** Lỗi nghiệp vụ có thể trả thẳng cho khách xem. */
export class BusinessError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

/**
 * Kiểm tra dữ liệu custom có khớp với cấu hình sản phẩm không.
 * Không tin bất cứ thứ gì frontend gửi lên: bộ màu, icon, switch đều
 * phải tồn tại thật trong cấu hình sản phẩm.
 */
export function validateCustomDataAgainstProduct(
  data: ClickerCustomData,
  product: ProductConfig,
): void {
  const { minCharacters, maxCharacters } = product.pricing;

  if (data.characterCount < minCharacters || data.characterCount > maxCharacters) {
    throw new BusinessError('INVALID_CHARACTER_COUNT', `Số ký tự phải từ ${minCharacters} đến ${maxCharacters}.`, {
      'customData.characterCount': `Số ký tự phải từ ${minCharacters} đến ${maxCharacters}.`,
    });
  }

  if (data.keys.length !== data.characterCount) {
    throw new BusinessError(
      'KEY_COUNT_MISMATCH',
      'Số phím gửi lên không khớp với số ký tự đã chọn.',
      { 'customData.keys': 'Số phím không khớp với số ký tự đã chọn.' },
    );
  }

  if (!product.palettes.some((p) => p.id === data.colorPaletteId)) {
    throw new BusinessError('INVALID_PALETTE', 'Bộ màu không hợp lệ.', {
      'customData.colorPaletteId': 'Bộ màu không hợp lệ.',
    });
  }

  if (!product.switches.some((s) => s.id === data.switchType)) {
    throw new BusinessError('INVALID_SWITCH', 'Loại switch không hợp lệ.', {
      'customData.switchType': 'Loại switch không hợp lệ.',
    });
  }

  data.keys.forEach((key, index) => {
    if (key.type === 'icon' && !product.icons.some((i) => i.id === key.iconId)) {
      throw new BusinessError('INVALID_ICON', `Icon của phím ${index + 1} không hợp lệ.`, {
        [`customData.keys.${index}`]: 'Icon không hợp lệ.',
      });
    }
    if (key.type === 'text' && key.value.trim().length === 0) {
      throw new BusinessError('EMPTY_KEY', `Phím ${index + 1} chưa có nội dung.`, {
        [`customData.keys.${index}`]: 'Phím chưa có nội dung.',
      });
    }
  });
}

/**
 * Tính giá CHÍNH THỨC ở server.
 * Giá do frontend gửi lên (clientQuotedUnitPrice) chỉ dùng để ghi log đối chiếu.
 */
export function priceOrder(data: ClickerCustomData, product: ProductConfig, quantity: number) {
  const unitPrice = calculateProductPrice(data.characterCount, product.pricing);
  const subtotal = unitPrice * quantity;
  return {
    unitPrice,
    subtotal,
    // Phí ship shop báo sau khi xác nhận -> chưa cộng vào total lúc tạo đơn.
    shippingFee: null as number | null,
    total: subtotal,
  };
}

/** Nội dung từng phím dưới dạng text để đưa vào ghi chú Pancake. */
export function buildKeyLabels(data: ClickerCustomData): string[] {
  return data.keys.map((key) => (key.type === 'text' ? key.value : key.iconId.toUpperCase()));
}
