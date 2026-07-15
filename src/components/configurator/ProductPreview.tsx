import { useState, type RefObject } from 'react';
import { Download, Maximize2 } from 'lucide-react';
import type { ClickerCustomData } from '../../../shared/orderSchema';
import type { ColorPalette } from '../../types/product';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ClickerTray from './ClickerTray';

interface ProductPreviewProps {
  customData: ClickerCustomData;
  palette: ColorPalette | undefined;
  /** Gắn vào khay để chụp ảnh preview khi đặt hàng. */
  captureRef?: RefObject<HTMLDivElement>;
}

export default function ProductPreview({ customData, palette, captureRef }: ProductPreviewProps) {
  const [zoomed, setZoomed] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  /** Tải ảnh preview về máy. html-to-image được nạp động để không nặng lần tải đầu. */
  const handleDownload = async () => {
    const node = captureRef?.current;
    if (!node) return;

    setSaving(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#FFF9F3' });

      const link = document.createElement('a');
      link.download = `raccoonie-clicker-${customData.characterCount}-phim.png`;
      link.href = dataUrl;
      link.click();
      showToast('Đã lưu ảnh thiết kế về máy.', 'success');
    } catch {
      showToast('Không lưu được ảnh. Bạn thử chụp màn hình giúp nhé.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Xem trước</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="Phóng to xem trước"
            title="Phóng to"
            className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={saving}
            aria-label="Lưu ảnh xem trước về máy"
            title="Lưu ảnh"
            className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-primary-soft hover:text-primary disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={captureRef} className="rounded-xl bg-cream p-4">
        <ClickerTray keys={customData.keys} palette={palette} switchType={customData.switchType} />
      </div>

      <p className="mt-3 text-center text-xs text-ink-muted">
        Bản xem trước mô phỏng bố cục và màu sắc. Màu in thực tế có thể lệch nhẹ.
      </p>

      <Modal
        open={zoomed}
        onClose={() => setZoomed(false)}
        title="Xem trước thiết kế"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleDownload} loading={saving} icon={<Download className="h-4 w-4" />}>
              Lưu ảnh
            </Button>
            <Button onClick={() => setZoomed(false)}>Đóng</Button>
          </div>
        }
      >
        <div className="rounded-xl bg-cream p-6">
          <ClickerTray keys={customData.keys} palette={palette} switchType={customData.switchType} />
        </div>
      </Modal>
    </div>
  );
}
