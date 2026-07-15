import { useRef, useState } from 'react';
import type { ProductConfig, SwitchType } from '../../types/product';

interface SwitchSelectorProps {
  product: ProductConfig;
  value: SwitchType;
  onChange: (switchType: SwitchType) => void;
}

const SWITCH_EMOJIS: Record<SwitchType, string> = {
  clicky: '🎹',
  smooth: '🌊',
};

const COPY: Record<SwitchType, { title: string; description: string }> = {
  clicky: {
    title: 'Clicky',
    description: 'Tiếng “tách tách” rõ ràng, cảm giác gõ rắn mạch.',
  },
  smooth: {
    title: 'Smooth',
    description: 'Không có tiếng tách, chỉ là âm va chạm nhẹ nhàng.',
  },
};

export default function SwitchSelector({ product, value, onChange }: SwitchSelectorProps) {
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [unavailable, setUnavailable] = useState<Record<string, boolean>>({});

  const play = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      setUnavailable((current) => ({ ...current, [id]: true }));
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Loại switch">
      {product.switches.map((option) => {
        const selected = option.id === value;
        const copy = COPY[option.id];
        return (
          <div
            key={option.id}
            className={[
              'rounded-[26px] border bg-white p-5 text-center transition-all',
              selected
                ? 'border-primary shadow-[0_10px_30px_rgba(236,93,145,0.14)] ring-2 ring-primary-soft'
                : 'border-line hover:border-primary/40',
            ].join(' ')}
          >
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className="w-full"
            >
              <div className="mb-4 text-4xl" aria-hidden="true">
                {SWITCH_EMOJIS[option.id]}
              </div>
              <p className="font-display text-2xl font-bold text-primary">{copy.title}</p>
              <p className="mt-2 min-h-[48px] text-base leading-relaxed text-ink-muted">
                {copy.description}
              </p>
            </button>

            {!unavailable[option.id] ? (
              <>
                <button
                  type="button"
                  onClick={() => play(option.id)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft/80"
                >
                  ▶ Nghe thử
                </button>
                <audio
                  ref={(el) => {
                    audioRefs.current[option.id] = el;
                  }}
                  src={option.sampleAudioUrl}
                  preload="none"
                  onError={() => setUnavailable((current) => ({ ...current, [option.id]: true }))}
                />
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
