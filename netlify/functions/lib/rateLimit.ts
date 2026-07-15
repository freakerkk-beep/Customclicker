/**
 * Rate limit cơ bản theo IP.
 *
 * LƯU Ý: Netlify Functions chạy serverless nên bộ nhớ này chỉ tồn tại trong
 * vòng đời của một instance — đây là lớp chặn spam "đủ dùng", không phải
 * rate limit tuyệt đối. Nếu cần chặt chẽ hơn, chuyển sang đếm bằng một bảng
 * Supabase hoặc Upstash Redis (xem README).
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Dọn bucket hết hạn để Map không phình theo thời gian. */
export function sweepRateLimit(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
