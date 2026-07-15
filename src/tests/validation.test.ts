import { describe, expect, it } from 'vitest';
import { isValidVnPhone, normalizePhone } from '../../shared/phone';
import {
  countGraphemes,
  normalizeKeycapText,
  sanitizeText,
  sliceGraphemes,
} from '../../shared/sanitize';
import {
  createOrderRequestSchema,
  getOrderQuerySchema,
  keyItemSchema,
} from '../../shared/orderSchema';

describe('normalizePhone / isValidVnPhone', () => {
  it.each([
    ['+84912345678', '0912345678'],
    ['84912345678', '0912345678'],
    ['0912 345 678', '0912345678'],
    ['091.234.5678', '0912345678'],
    ['0912-345-678', '0912345678'],
  ])('chuẩn hoá %s -> %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(['0912345678', '0387654321', '0777777777', '0555555555', '0999999999'])(
    'chấp nhận số hợp lệ %s',
    (phone) => {
      expect(isValidVnPhone(phone)).toBe(true);
    },
  );

  it.each(['091234567', '09123456789', '0112345678', 'abcdefghij', ''])(
    'từ chối số không hợp lệ %s',
    (phone) => {
      expect(isValidVnPhone(phone)).toBe(false);
    },
  );
});

describe('sanitize helpers', () => {
  it('cắt khoảng trắng đầu cuối', () => {
    expect(sanitizeText('  Linh  ', 50)).toBe('Linh');
  });

  it('giới hạn độ dài', () => {
    expect(sanitizeText('a'.repeat(100), 10)).toHaveLength(10);
  });

  it('loại bỏ ký tự điều khiển', () => {
    expect(sanitizeText('Li\u0000nh', 50)).toBe('Linh');
  });

  it('giữ nguyên dấu tiếng Việt', () => {
    expect(sanitizeText('Nguyễn Thị Ánh', 50)).toBe('Nguyễn Thị Ánh');
  });

  it('normalizeKeycapText tự động in hoa và cắt còn 1 ký tự', () => {
    expect(normalizeKeycapText('a', 1)).toBe('A');
    expect(normalizeKeycapText('đ', 1)).toBe('Đ');
    expect(normalizeKeycapText('ab', 1)).toBe('A');
  });
});

const validRequest = {
  productSlug: 'custom-clicker',
  quantity: 1,
  customData: {
    characterCount: 3,
    colorPaletteId: 'milk-tea-pastel',
    switchType: 'clicky',
    keys: [
      { type: 'text', value: 'a' },
      { type: 'icon', iconId: 'heart' },
      { type: 'text', value: 'c' },
    ],
  },
  customer: {
    fullName: 'Nguyễn Văn A',
    phone: '+84912345678',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Bến Nghé',
    addressDetail: '12 Nguyễn Huệ',
  },
  designConfirmed: true,
  idempotencyKey: 'abcdef12-3456-7890-abcd-ef1234567890',
};

describe('createOrderRequestSchema', () => {
  it('chấp nhận đơn hợp lệ, chuẩn hoá số điện thoại và chữ trên phím thành IN HOA', () => {
    const parsed = createOrderRequestSchema.parse(validRequest);
    expect(parsed.customer.phone).toBe('0912345678');
    expect(parsed.customData.keys[0]).toEqual({ type: 'text', value: 'A' });
    expect(parsed.customData.keys[2]).toEqual({ type: 'text', value: 'C' });
  });

  it('bắt buộc tick xác nhận thiết kế', () => {
    expect(() =>
      createOrderRequestSchema.parse({ ...validRequest, designConfirmed: false }),
    ).toThrow();
  });

  it('từ chối phím chữ rỗng — tất cả phím phải có nội dung', () => {
    expect(() =>
      createOrderRequestSchema.parse({
        ...validRequest,
        customData: {
          ...validRequest.customData,
          keys: [
            { type: 'text', value: '   ' },
            { type: 'text', value: 'B' },
            { type: 'text', value: 'C' },
          ],
        },
      }),
    ).toThrow();
  });

  it('nội dung phím dài hơn 1 ký tự sẽ bị tự cắt còn 1 ký tự', () => {
    const parsed = keyItemSchema.parse({ type: 'text', value: 'AB' });
    expect(parsed).toEqual({ type: 'text', value: 'A' });
  });

  it('từ chối icon không nằm trong 5 icon được phép', () => {
    expect(() =>
      createOrderRequestSchema.parse({
        ...validRequest,
        customData: {
          ...validRequest.customData,
          keys: [
            { type: 'text', value: 'A' },
            { type: 'icon', iconId: 'smile' },
            { type: 'text', value: 'C' },
          ],
        },
      }),
    ).toThrow();
  });

  it('từ chối số điện thoại không hợp lệ', () => {
    expect(() =>
      createOrderRequestSchema.parse({
        ...validRequest,
        customer: { ...validRequest.customer, phone: '0112345678' },
      }),
    ).toThrow();
  });

  it('từ chối họ tên dưới 2 ký tự', () => {
    expect(() =>
      createOrderRequestSchema.parse({
        ...validRequest,
        customer: { ...validRequest.customer, fullName: 'A' },
      }),
    ).toThrow();
  });

  it('bắt buộc có idempotencyKey', () => {
    const withoutKey = { ...validRequest, idempotencyKey: undefined };
    expect(() => createOrderRequestSchema.parse(withoutKey)).toThrow();
  });

  it('honeypot có nội dung thì không qua được schema', () => {
    expect(() =>
      createOrderRequestSchema.parse({ ...validRequest, website: 'http://spam.example' }),
    ).toThrow();
  });

  it('bỏ qua giá do frontend gửi lên — chỉ nhận như thông tin tham khảo', () => {
    const parsed = createOrderRequestSchema.parse({ ...validRequest, clientQuotedUnitPrice: 1 });
    expect(parsed.clientQuotedUnitPrice).toBe(1);
    expect(parsed.customData.characterCount).toBe(3);
  });
});

describe('getOrderQuerySchema', () => {
  it('chấp nhận mã đơn đúng định dạng', () => {
    const parsed = getOrderQuerySchema.parse({ orderCode: 'rac-260715-a8f2', phone: '0912345678' });
    expect(parsed.orderCode).toBe('RAC-260715-A8F2');
  });

  it.each(['RAC-123-A8F2', 'XXX-260715-A8F2', 'RAC-260715-A8F', ''])(
    'từ chối mã sai định dạng %s',
    (orderCode) => {
      expect(() => getOrderQuerySchema.parse({ orderCode, phone: '0912345678' })).toThrow();
    },
  );
});

describe('đếm ký tự trên phím (emoji = 1 ký tự)', () => {
  it.each([
    ['A', 1],
    ['Đ', 1],
    ['🎉', 1],
    ['❤️', 1],
    ['🇻🇳', 1],
    ['👨‍👩‍👧', 1],
    ['AB', 2],
  ])('countGraphemes(%s) = %i', (input, expected) => {
    expect(countGraphemes(input)).toBe(expected);
  });

  it('đếm khác với .length của JS ở emoji', () => {
    expect('🎉'.length).toBe(2);
    expect(countGraphemes('🎉')).toBe(1);
  });

  it('sliceGraphemes không xé đôi emoji', () => {
    expect(sliceGraphemes('a🎉b🎉c', 1)).toBe('a');
    expect(sliceGraphemes('🎉🎉', 1)).toBe('🎉');
  });

  it('nhận 1 emoji trên một phím và tự cắt chuỗi dài hơn 1 ký tự', () => {
    const singleEmoji = keyItemSchema.parse({ type: 'text', value: '🎉' });
    const twoEmoji = keyItemSchema.parse({ type: 'text', value: '🎉🎉' });
    const twoLetters = keyItemSchema.parse({ type: 'text', value: 'AB' });

    expect(singleEmoji).toEqual({ type: 'text', value: '🎉' });
    expect(twoEmoji).toEqual({ type: 'text', value: '🎉' });
    expect(twoLetters).toEqual({ type: 'text', value: 'A' });
  });
});
