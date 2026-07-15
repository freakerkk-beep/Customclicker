import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export default function Card({ children, padded = true, className = '', ...rest }: CardProps) {
  return (
    <div className={`card-surface ${padded ? 'p-5 sm:p-6' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      {/* Nhãn mục kiểu web cũ: chữ tím, in hoa, giãn chữ nhẹ ("BỘ MÀU (7 MẪU)"). */}
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-accent">
        {children}
      </h2>
      {hint ? <p className="mt-1 text-sm text-ink-muted">{hint}</p> : null}
    </div>
  );
}
