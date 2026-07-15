import { describe, expect, it } from 'vitest';
import {
  CLICKER_PRICING,
  PriceValidationError,
  buildPriceTable,
  calculateProductPrice,
  safeCalculateProductPrice,
} from '../../shared/pricing';
import { formatVnd } from '../../shared/currency';

describe('calculateProductPrice — bảng giá cố định', () => {
  it.each([
    [3, 79_000],
    [4, 99_000],
    [5, 119_000],
    [6, 139_000],
    [7, 149_000],
  ])('%i ký tự = %i đ', (count, expected) => {
    expect(calculateProductPrice(count)).toBe(expected);
  });
});

describe('calculateProductPrice — trên 7 ký tự cộng thêm 20.000đ mỗi ký tự', () => {
  it.each([
    [8, 169_000],
    [9, 189_000],
    [10, 209_000],
    [11, 229_000],
    [12, 249_000],
  ])('%i ký tự = %i đ', (count, expected) => {
    expect(calculateProductPrice(count)).toBe(expected);
  });

  it('khớp đúng công thức 149000 + (n - 7) * 20000', () => {
    for (let n = 8; n <= CLICKER_PRICING.maxCharacters; n += 1) {
      expect(calculateProductPrice(n)).toBe(149_000 + (n - 7) * 20_000);
    }
  });
});

describe('calculateProductPrice — validation', () => {
  it.each([2, 1, 0, -3])('dưới 3 ký tự (%i) thì báo lỗi', (count) => {
    expect(() => calculateProductPrice(count)).toThrow(PriceValidationError);
  });

  it.each([13, 20, 100])('trên 12 ký tự (%i) thì báo lỗi', (count) => {
    expect(() => calculateProductPrice(count)).toThrow(PriceValidationError);
  });

  it('số không nguyên thì báo lỗi', () => {
    expect(() => calculateProductPrice(5.5)).toThrow(PriceValidationError);
  });

  it('safeCalculateProductPrice trả null thay vì ném lỗi', () => {
    expect(safeCalculateProductPrice(2)).toBeNull();
    expect(safeCalculateProductPrice(13)).toBeNull();
    expect(safeCalculateProductPrice(6)).toBe(139_000);
  });
});

describe('buildPriceTable', () => {
  it('có đủ 10 mức từ 3 đến 12 ký tự', () => {
    const table = buildPriceTable();
    expect(table).toHaveLength(10);
    expect(table[0]).toEqual({ characterCount: 3, price: 79_000 });
    expect(table[9]).toEqual({ characterCount: 12, price: 249_000 });
  });

  it('giá luôn tăng dần theo số ký tự', () => {
    const table = buildPriceTable();
    for (let i = 1; i < table.length; i += 1) {
      expect(table[i]!.price).toBeGreaterThan(table[i - 1]!.price);
    }
  });
});

describe('formatVnd — định dạng tiền Việt Nam', () => {
  it.each([
    [79_000, '79.000đ'],
    [99_000, '99.000đ'],
    [119_000, '119.000đ'],
    [249_000, '249.000đ'],
    [0, '0đ'],
  ])('%i -> %s', (amount, expected) => {
    expect(formatVnd(amount)).toBe(expected);
  });
});
