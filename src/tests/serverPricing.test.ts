import { describe, expect, it } from 'vitest';
import { buildKeyLabels, priceOrder, validateCustomDataAgainstProduct } from '../../netlify/functions/lib/orderBuilder';
import { customClickerProduct } from '../products/custom-clicker';
import type { ClickerCustomData } from '../../shared/orderSchema';

function makeData(overrides: Partial<ClickerCustomData> = {}): ClickerCustomData {
  return {
    characterCount: 6,
    colorPaletteId: 'milk-tea',
    switchType: 'clicky',
    keys: [
      { type: 'text', value: 'A' },
      { type: 'text', value: 'B' },
      { type: 'icon', iconId: 'heart' },
      { type: 'text', value: 'LINH' },
      { type: 'icon', iconId: 'star' },
      { type: 'text', value: 'C' },
    ],
    ...overrides,
  };
}

describe('backend không tin giá do frontend gửi lên', () => {
  it('tự tính đơn giá từ số ký tự', () => {
    const result = priceOrder(makeData(), customClickerProduct, 1);
    expect(result.unitPrice).toBe(139_000);
    expect(result.subtotal).toBe(139_000);
    expect(result.total).toBe(139_000);
  });

  it('nhân đúng theo số lượng', () => {
    const result = priceOrder(makeData({ characterCount: 3, keys: makeData().keys.slice(0, 3) }), customClickerProduct, 3);
    expect(result.unitPrice).toBe(79_000);
    expect(result.subtotal).toBe(237_000);
  });

  it('phí ship để trống lúc tạo đơn — shop xác nhận sau', () => {
    expect(priceOrder(makeData(), customClickerProduct, 1).shippingFee).toBeNull();
  });
});

describe('validateCustomDataAgainstProduct', () => {
  it('chấp nhận dữ liệu hợp lệ', () => {
    expect(() => validateCustomDataAgainstProduct(makeData(), customClickerProduct)).not.toThrow();
  });

  it('từ chối bộ màu không có trong cấu hình sản phẩm', () => {
    expect(() =>
      validateCustomDataAgainstProduct(makeData({ colorPaletteId: 'hacker-gold' }), customClickerProduct),
    ).toThrow(/Bộ màu không hợp lệ/);
  });

  it('từ chối icon không có trong cấu hình sản phẩm', () => {
    const data = makeData();
    data.keys[2] = { type: 'icon', iconId: 'skull' };
    expect(() => validateCustomDataAgainstProduct(data, customClickerProduct)).toThrow(/Icon/);
  });

  it('từ chối khi số phím không khớp số ký tự', () => {
    expect(() =>
      validateCustomDataAgainstProduct(makeData({ characterCount: 5 }), customClickerProduct),
    ).toThrow(/không khớp/);
  });

  it('từ chối số ký tự ngoài khoảng 3–12', () => {
    expect(() =>
      validateCustomDataAgainstProduct(makeData({ characterCount: 2, keys: makeData().keys.slice(0, 2) }), customClickerProduct),
    ).toThrow(/Số ký tự/);
  });
});

describe('buildKeyLabels', () => {
  it('chữ giữ nguyên, icon viết hoa theo ID', () => {
    expect(buildKeyLabels(makeData())).toEqual(['A', 'B', 'HEART', 'LINH', 'STAR', 'C']);
  });
});
