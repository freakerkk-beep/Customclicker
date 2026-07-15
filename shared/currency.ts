/** Định dạng tiền Việt Nam: 79000 -> "79.000đ" */
export function formatVnd(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.abs(rounded));
  return `${rounded < 0 ? '-' : ''}${formatted}đ`;
}

/** Bản có khoảng trắng, dùng cho chỗ cần đọc chậm: "79.000 đ" */
export function formatVndSpaced(amount: number): string {
  return formatVnd(amount).replace('đ', ' đ');
}
