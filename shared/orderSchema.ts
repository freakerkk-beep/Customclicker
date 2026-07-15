import { z } from 'zod';
import { LIMITS } from './constants';
import { normalizePhone, VN_PHONE_REGEX } from './phone';
import { collapseWhitespace, sanitizeText } from './sanitize';

/**
 * Schema dùng chung. Frontend dùng để báo lỗi sớm cho khách,
 * backend dùng làm nguồn xác thực CHÍNH THỨC.
 */

const trimmedText = (max: number) =>
  z
    .string()
    .transform((v) => sanitizeText(v, max))
    .pipe(z.string());

/** Nội dung một phím: hoặc chữ, hoặc icon. */
export const keyItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    value: z
      .string()
      // Kiểm tra độ dài trước khi cắt chuỗi để dữ liệu quá giới hạn bị từ chối,
      // thay vì âm thầm rút ngắn nội dung khách đã nhập.
      .transform((v) => collapseWhitespace(v))
      .pipe(
        z
          .string()
          .min(1, 'Phím chưa có nội dung.')
          .max(LIMITS.keyTextMaxLength, `Nội dung phím tối đa ${LIMITS.keyTextMaxLength} ký tự.`),
      )
      .transform((v) => sanitizeText(v, LIMITS.keyTextMaxLength)),
  }),
  z.object({
    type: z.literal('icon'),
    iconId: z.string().min(1, 'Phím chưa chọn icon.').max(32),
  }),
]);

export type KeyItem = z.infer<typeof keyItemSchema>;

/** Dữ liệu custom của Custom Clicker — lưu nguyên vào order_items.custom_data. */
export const clickerCustomDataSchema = z.object({
  characterCount: z.number().int(),
  colorPaletteId: z.string().min(1).max(48),
  switchType: z.enum(['clicky', 'smooth']),
  keys: z.array(keyItemSchema).min(1).max(24),
});

export type ClickerCustomData = z.infer<typeof clickerCustomDataSchema>;

export const customerSchema = z.object({
  fullName: z
    .string()
    .transform((v) => sanitizeText(collapseWhitespace(v), LIMITS.customerNameMax))
    .pipe(z.string().min(LIMITS.customerNameMin, 'Họ tên phải có ít nhất 2 ký tự.')),
  phone: z
    .string()
    .transform((v) => normalizePhone(v))
    .pipe(z.string().regex(VN_PHONE_REGEX, 'Số điện thoại không hợp lệ.')),
  email: z
    .union([z.string().email('Email không hợp lệ.'), z.literal('')])
    .optional()
    .transform((v) => (v ? v : undefined)),
  province: trimmedText(100).pipe(z.string().min(1, 'Vui lòng nhập tỉnh/thành phố.')),
  district: trimmedText(100).pipe(z.string().min(1, 'Vui lòng nhập quận/huyện.')),
  ward: trimmedText(100).pipe(z.string().min(1, 'Vui lòng nhập phường/xã.')),
  addressDetail: trimmedText(LIMITS.addressMax).pipe(
    z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết.'),
  ),
  note: trimmedText(LIMITS.noteMax).optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export const createOrderRequestSchema = z.object({
  productSlug: z.string().min(1).max(64),
  quantity: z.number().int().min(LIMITS.quantityMin).max(LIMITS.quantityMax),
  customData: clickerCustomDataSchema,
  customer: customerSchema,
  /** Khách phải tick xác nhận đã kiểm tra thiết kế. */
  designConfirmed: z.literal(true, {
    errorMap: () => ({ message: 'Bạn cần xác nhận đã kiểm tra thiết kế.' }),
  }),
  /** Khoá chống tạo đơn trùng khi double click / retry. */
  idempotencyKey: z.string().min(8).max(64),
  /**
   * Ảnh preview dạng data URL PNG (tuỳ chọn).
   * Backend tự upload lên Supabase Storage bằng service role key —
   * trình duyệt KHÔNG được ghi thẳng vào storage.
   */
  previewImageBase64: z
    .string()
    .max(LIMITS.previewImageMaxChars)
    .regex(/^data:image\/png;base64,/, 'Ảnh preview không hợp lệ.')
    .optional(),
  /** Honeypot: bot điền vào, người thật thì không. Phải rỗng. */
  website: z.string().max(0).optional().or(z.literal('')),
  /**
   * Giá frontend đang hiển thị. CHỈ dùng để ghi log đối chiếu.
   * Backend luôn tự tính lại và không dùng giá trị này để tính tiền.
   */
  clientQuotedUnitPrice: z.number().int().nonnegative().optional(),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const getOrderQuerySchema = z.object({
  orderCode: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .pipe(z.string().regex(/^RAC-\d{6}-[A-Z0-9]{4}$/, 'Mã đơn không đúng định dạng.')),
  phone: z
    .string()
    .transform((v) => normalizePhone(v))
    .pipe(z.string().regex(VN_PHONE_REGEX, 'Số điện thoại không hợp lệ.')),
});

export type GetOrderQuery = z.infer<typeof getOrderQuerySchema>;
