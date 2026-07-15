/**
 * NGUỒN GIÁ DUY NHẤT của hệ thống.
 *
 * File này được import bởi CẢ frontend (src/utils/pricing.ts) và
 * backend (netlify/functions/create-order.ts). Muốn đổi bảng giá thì
 * chỉ sửa ở đây (hoặc sửa pricing trong file cấu hình sản phẩm).
 *
 * Backend LUÔN tính lại giá và không bao giờ tin giá frontend gửi lên.
 */

export interface PricingConfig {
  /** Số ký tự tối thiểu cho phép đặt. */
  minCharacters: number;
  /** Số ký tự tối đa cho phép đặt. */
  maxCharacters: number;
  /** Bảng giá cố định theo số ký tự (đơn vị: VNĐ). */
  fixedTable: Record<number, number>;
  /** Mốc ký tự cuối cùng có trong bảng giá cố định. */
  extraFromCharacter: number;
  /** Giá tại mốc `extraFromCharacter`. */
  extraBasePrice: number;
  /** Mỗi ký tự vượt quá `extraFromCharacter` cộng thêm bao nhiêu. */
  extraPricePerCharacter: number;
}

/** Bảng giá Custom Clicker Raccoonie (phiên bản hiện tại). */
export const CLICKER_PRICING: PricingConfig = {
  minCharacters: 3,
  maxCharacters: 12,
  fixedTable: {
    3: 79_000,
    4: 99_000,
    5: 119_000,
    6: 139_000,
    7: 149_000,
  },
  extraFromCharacter: 7,
  extraBasePrice: 149_000,
  extraPricePerCharacter: 20_000,
};

/** Lỗi validation khi số ký tự nằm ngoài khoảng cho phép. */
export class PriceValidationError extends Error {
  public readonly code = 'INVALID_CHARACTER_COUNT';

  constructor(message: string) {
    super(message);
    this.name = 'PriceValidationError';
  }
}

/**
 * Tính đơn giá của một sản phẩm clicker theo số ký tự.
 *
 * - 3..7 ký tự: lấy thẳng từ bảng giá cố định.
 * - Trên 7 ký tự: extraBasePrice + (n - 7) * extraPricePerCharacter.
 *
 * @throws {PriceValidationError} nếu số ký tự không hợp lệ.
 */
export function calculateProductPrice(
  characterCount: number,
  pricing: PricingConfig = CLICKER_PRICING,
): number {
  if (!Number.isInteger(characterCount)) {
    throw new PriceValidationError('Số ký tự phải là số nguyên.');
  }
  if (characterCount < pricing.minCharacters || characterCount > pricing.maxCharacters) {
    throw new PriceValidationError(
      `Số ký tự phải từ ${pricing.minCharacters} đến ${pricing.maxCharacters}.`,
    );
  }

  const fixed = pricing.fixedTable[characterCount];
  if (fixed !== undefined) return fixed;

  return (
    pricing.extraBasePrice + (characterCount - pricing.extraFromCharacter) * pricing.extraPricePerCharacter
  );
}

/** Bản không ném lỗi — dùng cho UI khi giá trị có thể tạm thời không hợp lệ. */
export function safeCalculateProductPrice(
  characterCount: number,
  pricing: PricingConfig = CLICKER_PRICING,
): number | null {
  try {
    return calculateProductPrice(characterCount, pricing);
  } catch {
    return null;
  }
}

/** Danh sách (số ký tự → giá) để hiển thị bảng giá trên giao diện. */
export function buildPriceTable(
  pricing: PricingConfig = CLICKER_PRICING,
): Array<{ characterCount: number; price: number }> {
  const rows: Array<{ characterCount: number; price: number }> = [];
  for (let n = pricing.minCharacters; n <= pricing.maxCharacters; n += 1) {
    rows.push({ characterCount: n, price: calculateProductPrice(n, pricing) });
  }
  return rows;
}
