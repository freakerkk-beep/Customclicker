import { randomInt } from 'node:crypto';

/**
 * Sinh mã đơn dạng RAC-260715-A8F2
 *  - RAC     : tiền tố Raccoonie
 *  - 260715  : ngày tạo (YYMMDD, giờ Việt Nam)
 *  - A8F2    : 4 ký tự ngẫu nhiên viết hoa
 *
 * Mã LUÔN được sinh ở backend. Frontend không bao giờ tự tạo mã đơn.
 */
const PREFIX = 'RAC';

// Bỏ các ký tự dễ nhìn nhầm khi khách đọc mã qua điện thoại: I, O, 0, 1.
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function datePartVn(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}${get('month')}${get('day')}`;
}

function randomPart(length = 4): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return out;
}

export function generateOrderCode(date: Date = new Date()): string {
  return `${PREFIX}-${datePartVn(date)}-${randomPart()}`;
}

export const ORDER_CODE_REGEX = /^RAC-\d{6}-[A-Z0-9]{4}$/;
