import type { ProductConfig } from '../types/product';
import { customClickerProduct } from './custom-clicker';

/**
 * DANH BẠ SẢN PHẨM.
 *
 * Thêm sản phẩm mới: import file cấu hình rồi thêm vào mảng bên dưới.
 * ProductPage đọc slug từ URL và tự tìm trong danh bạ này.
 *
 * Sau này khi chuyển sang quản lý bằng Supabase (bảng products /
 * product_options), chỉ cần thay phần thân các hàm dưới đây bằng lời gọi
 * API — phần còn lại của website không phải sửa.
 */
const PRODUCTS: ProductConfig[] = [customClickerProduct];

export function getAllProducts(): ProductConfig[] {
  return PRODUCTS.filter((p) => p.active);
}

export function getProductBySlug(slug: string): ProductConfig | undefined {
  return PRODUCTS.find((p) => p.slug === slug && p.active);
}

export function productExists(slug: string): boolean {
  return getProductBySlug(slug) !== undefined;
}
