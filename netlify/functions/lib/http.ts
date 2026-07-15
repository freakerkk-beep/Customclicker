import type { HandlerEvent, HandlerResponse } from '@netlify/functions';

const BASE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export function json(statusCode: number, body: unknown): HandlerResponse {
  return { statusCode, headers: BASE_HEADERS, body: JSON.stringify(body) };
}

export function ok(body: Record<string, unknown>): HandlerResponse {
  return json(200, { ok: true, ...body });
}

export function fail(
  statusCode: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
): HandlerResponse {
  return json(statusCode, { ok: false, error: { code, message, ...(fields ? { fields } : {}) } });
}

export function methodNotAllowed(allowed: string): HandlerResponse {
  return {
    statusCode: 405,
    headers: { ...BASE_HEADERS, Allow: allowed },
    body: JSON.stringify({
      ok: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Phương thức không được hỗ trợ.' },
    }),
  };
}

export function parseJsonBody(event: HandlerEvent): unknown {
  if (!event.body) return null;
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  return JSON.parse(raw) as unknown;
}

/** IP của khách, ưu tiên header do Netlify gắn. */
export function getClientIp(event: HandlerEvent): string {
  const headers = event.headers ?? {};
  return (
    headers['x-nf-client-connection-ip'] ??
    headers['x-forwarded-for']?.split(',')[0]?.trim() ??
    'unknown'
  );
}

/** Đọc biến môi trường bắt buộc, thiếu thì ném lỗi rõ ràng. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Thiếu biến môi trường: ${name}`);
  }
  return value;
}

export function envFlag(name: string, defaultValue = false): boolean {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/** Chuyển lỗi Zod thành map { field: message } cho frontend hiển thị. */
export function zodFieldErrors(issues: Array<{ path: (string | number)[]; message: string }>) {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join('.') || 'form';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
