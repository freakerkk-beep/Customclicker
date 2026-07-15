import {
  Bolt,
  Crown,
  Flower2,
  Heart,
  Moon,
  Music,
  PawPrint,
  Smile,
  Star,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import type { IconId } from '../types/product';

/**
 * Ánh xạ ID icon -> component vẽ icon.
 * Đơn hàng chỉ lưu ID (ví dụ "heart"), không bao giờ lưu HTML/SVG do khách nhập.
 */
const ICON_COMPONENTS: Record<IconId, LucideIcon> = {
  heart: Heart,
  star: Star,
  smile: Smile,
  flower: Flower2,
  music: Music,
  paw: PawPrint,
  crown: Crown,
  bolt: Bolt,
  sun: Sun,
  moon: Moon,
};

export function getIconComponent(id: string): LucideIcon | null {
  return ICON_COMPONENTS[id as IconId] ?? null;
}

export function isIconId(id: string): id is IconId {
  return id in ICON_COMPONENTS;
}

/** Nhãn in hoa dùng trong ghi chú đơn hàng: "heart" -> "HEART". */
export function iconIdToNoteLabel(id: string): string {
  return id.toUpperCase();
}
