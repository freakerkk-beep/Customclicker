/**
 * Làm sạch chuỗi do khách nhập trước khi lưu / gửi sang Pancake.
 * Không bao giờ render chuỗi này dưới dạng HTML — chỉ dùng như text.
 */
export function sanitizeText(input: string, maxLength: number): string {
  return input
    // bỏ ký tự điều khiển (giữ lại xuống dòng và tab)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);
}

/** Rút gọn khoảng trắng thừa về 1 dấu cách, dùng cho tên và địa chỉ. */
export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}
