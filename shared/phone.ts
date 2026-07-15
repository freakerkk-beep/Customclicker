/**
 * Chuẩn hoá số điện thoại Việt Nam về dạng bắt đầu bằng 0.
 * "+84 912 345 678" -> "0912345678"
 */
export function normalizePhone(raw: string): string {
  const digitsOnly = raw.replace(/[\s.\-()]/g, '').trim();
  if (digitsOnly.startsWith('+84')) return `0${digitsOnly.slice(3)}`;
  if (digitsOnly.startsWith('84') && digitsOnly.length === 11) return `0${digitsOnly.slice(2)}`;
  return digitsOnly;
}

/** Đầu số di động Việt Nam hợp lệ sau khi chuẩn hoá. */
export const VN_PHONE_REGEX = /^0[35789]\d{8}$/;

export function isValidVnPhone(raw: string): boolean {
  return VN_PHONE_REGEX.test(normalizePhone(raw));
}
