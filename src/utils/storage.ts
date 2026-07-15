/**
 * Lưu bản thiết kế tạm vào localStorage để khách tải lại trang không mất dữ liệu.
 * Không lưu bất kỳ thông tin nhạy cảm nào ngoài nội dung thiết kế.
 */
const PREFIX = 'raccoonie:design:';
const VERSION = 1;

interface StoredDesign<T> {
  version: number;
  savedAt: number;
  data: T;
}

function keyFor(slug: string): string {
  return `${PREFIX}${slug}`;
}

export function saveDesign<T>(slug: string, data: T): void {
  try {
    const payload: StoredDesign<T> = { version: VERSION, savedAt: Date.now(), data };
    window.localStorage.setItem(keyFor(slug), JSON.stringify(payload));
  } catch {
    // Trình duyệt chặn localStorage (chế độ riêng tư) — bỏ qua, không làm hỏng trang.
  }
}

export function loadDesign<T>(slug: string): { data: T; savedAt: number } | null {
  try {
    const raw = window.localStorage.getItem(keyFor(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDesign<T>;
    if (parsed.version !== VERSION) return null;
    return { data: parsed.data, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

export function clearDesign(slug: string): void {
  try {
    window.localStorage.removeItem(keyFor(slug));
  } catch {
    // bỏ qua
  }
}

/** Sinh idempotency key cho một lần đặt hàng. */
export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
