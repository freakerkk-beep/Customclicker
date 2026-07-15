/* eslint-disable no-control-regex */
/**
 * Làm sạch chuỗi do khách nhập trước khi lưu / gửi sang Pancake.
 * Không bao giờ render chuỗi này dưới dạng HTML — chỉ dùng như text.
 */
export function sanitizeText(input: string, maxLength: number): string {
  return (
    input
      // bỏ ký tự điều khiển (giữ lại xuống dòng và tab)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\r\n/g, '\n')
      .trim()
      .slice(0, maxLength)
  );
}

/** Rút gọn khoảng trắng thừa về 1 dấu cách, dùng cho tên và địa chỉ. */
export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * ĐẾM KÝ TỰ THEO CÁCH NGƯỜI DÙNG NHÌN THẤY.
 *
 * Vì sao cần hàm này: JavaScript đếm chuỗi theo "code unit", không theo ký tự
 * mắt thường nhìn thấy. Ví dụ "🎉".length = 2, "❤️".length = 2, cờ "🇻🇳".length = 4.
 * Nếu dùng .length thì khách gõ 2 emoji đã bị báo vượt quá 4 ký tự — sai.
 *
 * Intl.Segmenter gom đúng từng cụm ký tự (grapheme) như người dùng thấy.
 * Trình duyệt hiện đại và Node 20+ đều hỗ trợ; nếu không có thì lùi về đếm
 * theo code point (vẫn đúng với đa số emoji đơn).
 */
interface GraphemeSegment {
  segment: string;
}

interface SegmenterInstance {
  segment(input: string): Iterable<GraphemeSegment>;
}

type SegmenterConstructor = new (
  locale?: string | string[],
  options?: { granularity: 'grapheme' },
) => SegmenterInstance;

function segment(input: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: SegmenterConstructor }).Segmenter;
  if (typeof Seg === 'function') {
    const segmenter = new Seg('vi', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(input), (part) => part.segment);
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
