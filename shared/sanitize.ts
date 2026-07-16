/* eslint-disable no-control-regex */
/**
 * Làm sạch chuỗi do khách nhập trước khi lưu / gửi sang Pancake.
 * Không bao giờ render chuỗi này dưới dạng HTML — chỉ dùng như text.
 */
export function sanitizeText(input: string, maxLength: number): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);
}

/** Rút gọn khoảng trắng thừa về 1 dấu cách, dùng cho tên và địa chỉ. */
export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

type SegmentPart = { segment: string };
type SegmenterLike = {
  segment: (input: string) => Iterable<SegmentPart>;
};

type SegmenterCtor = new (
  locales?: string | string[],
  options?: { granularity: 'grapheme' },
) => SegmenterLike;

function segment(input: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
  if (typeof Seg === 'function') {
    const seg = new Seg('vi', { granularity: 'grapheme' });
    return Array.from(seg.segment(input), (part) => part.segment);
  }
  return Array.from(input);
}

/** Số ký tự người dùng thực sự nhìn thấy ("🎉ab" -> 3, không phải 4). */
export function countGraphemes(input: string): number {
  return segment(input).length;
}

/**
 * Cắt chuỗi theo số ký tự nhìn thấy, KHÔNG cắt đôi emoji.
 * `"ab🎉".slice(0,3)` của JS sẽ tạo ra ký tự rác; hàm này thì không.
 */
export function sliceGraphemes(input: string, maxGraphemes: number): string {
  const parts = segment(input);
  return parts.length <= maxGraphemes ? input : parts.slice(0, maxGraphemes).join('');
}

/**
 * Chuẩn hoá chữ in trên phím:
 * - bỏ khoảng trắng thừa
 * - tự động chuyển IN HOA
 * - cắt về đúng số ký tự nhìn thấy cho phép
 */
export function normalizeKeycapText(input: string, maxGraphemes = 1): string {
  const cleaned = sanitizeText(input, 32).toLocaleUpperCase('vi-VN');
  return sliceGraphemes(cleaned, maxGraphemes);
}
