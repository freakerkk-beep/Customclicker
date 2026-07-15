import { describe, expect, it } from 'vitest';
import { ORDER_CODE_REGEX, generateOrderCode } from '../../netlify/functions/lib/orderCode';

describe('generateOrderCode', () => {
  it('đúng định dạng RAC-YYMMDD-XXXX', () => {
    expect(generateOrderCode()).toMatch(ORDER_CODE_REGEX);
  });

  it('nhúng đúng ngày theo giờ Việt Nam', () => {
    // 2026-07-15 12:00 UTC -> 15/07/2026 tại Việt Nam (UTC+7)
    expect(generateOrderCode(new Date('2026-07-15T12:00:00Z')).startsWith('RAC-260715-')).toBe(true);
  });

  it('đổi ngày đúng khi qua mốc nửa đêm giờ Việt Nam', () => {
    // 2026-07-15 18:00 UTC = 2026-07-16 01:00 giờ Việt Nam
    expect(generateOrderCode(new Date('2026-07-15T18:00:00Z')).startsWith('RAC-260716-')).toBe(true);
  });

  it('phần ngẫu nhiên hiếm khi trùng nhau', () => {
    const codes = new Set(Array.from({ length: 500 }, () => generateOrderCode()));
    // 32^4 ≈ 1 triệu tổ hợp -> 500 mã gần như chắc chắn không trùng nhiều.
    expect(codes.size).toBeGreaterThan(495);
  });
});
