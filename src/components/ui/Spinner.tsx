import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12 text-ink-muted"
      role="status"
    >
      <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
