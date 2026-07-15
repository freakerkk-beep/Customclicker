import { useEffect } from 'react';

/**
 * Hỏi lại trước khi khách đóng tab / tải lại trang nếu đã custom nhưng chưa đặt.
 * Trình duyệt hiện thông báo mặc định của nó, không cho tuỳ biến nội dung.
 */
export function useUnsavedChangesWarning(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return undefined;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Một số trình duyệt cũ vẫn cần returnValue được gán.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled]);
}
