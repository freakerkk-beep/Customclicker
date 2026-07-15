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
  /** Dạng gọn đặt trực tiếp trong card các bước. */
  compact?: boolean;
}

export default function ProductPreview({
  customData,
  palette,
  captureRef,
  compact = false,
}: ProductPreviewProps) {
  const [zoomed, setZoomed] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleDownload = async () => {
    const node = captureRef?.current;
    if (!node) return;

    setSaving(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#FFFFFF' });

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
    <div className={compact ? 'mx-auto w-full max-w-[430px]' : 'card-surface p-5'}>
      <div className={`flex items-center justify-between gap-2 ${compact ? 'mb-2' : 'mb-4'}`}>
        <p className={compact ? 'text-xs text-ink-muted' : 'text-base font-semibold'}>
          {compact ? 'Xem trước clicker của bạn' : 'Xem trước'}
        </p>
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label="Phóng to xem trước"
            title="Phóng to"
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={saving}
            aria-label="Lưu ảnh xem trước về máy"
            title="Lưu ảnh"
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-primary-soft hover:text-primary disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={captureRef}
        className={compact ? 'rounded-2xl bg-white px-2 py-3 sm:px-5' : 'rounded-xl bg-cream p-4'}
      >
        <ClickerTray
          keys={customData.keys}
          palette={palette}
          switchType={customData.switchType}
          showMeta={!compact}
        />
      </div>

      {!compact ? (
        <p className="mt-3 text-center text-xs text-ink-muted">
          Bản xem trước mô phỏng bố cục và màu sắc. Màu in thực tế có thể lệch nhẹ.
        </p>
      ) : null}

      <Modal
        open={zoomed}
        onClose={() => setZoomed(false)}
        title="Xem trước thiết kế"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={handleDownload}
              loading={saving}
              icon={<Download className="h-4 w-4" />}
            >
              Lưu ảnh
            </Button>
            <Button onClick={() => setZoomed(false)}>Đóng</Button>
          </div>
        }
      >
        <div className="rounded-xl bg-cream p-6">
          <ClickerTray
            keys={customData.keys}
            palette={palette}
            switchType={customData.switchType}
          />
        </div>
      </Modal>
    </div>
  );
}
