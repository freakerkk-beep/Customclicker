import { useRef, useState } from 'react';
import { Check, Volume2 } from 'lucide-react';
import type { ProductConfig, SwitchType } from '../../types/product';
import Card, { CardTitle } from '../ui/Card';

interface SwitchSelectorProps {
  product: ProductConfig;
  value: SwitchType;
  onChange: (switchType: SwitchType) => void;
}

export default function SwitchSelector({ product, value, onChange }: SwitchSelectorProps) {
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  // Ẩn nút nghe thử nếu file âm thanh chưa được thêm vào public/audio/.
  const [unavailable, setUnavailable] = useState<Record<string, boolean>>({});

  const play = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;
    audio.currentTime = 0;
    // File có thể chưa tồn tại — bắt lỗi để trang không bị crash.
    void audio.play().catch(() => {
      setUnavailable((current) => ({ ...current, [id]: true }));
    });
  };

  return (
    <Card>
      <CardTitle hint="Cảm giác bấm và tiếng kêu khác nhau rõ rệt giữa hai loại.">
        Âm thanh switch
      </CardTitle>

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Loại switch">
        {product.switches.map((option) => {
          const selected = option.id === value;
          return (
            <div
              key={option.id}
              className={[
                'relative rounded-xl border p-4 transition-all',
                selected ? 'border-primary bg-primary-soft/60 shadow-soft' : 'border-line bg-white',
              ].join(' ')}
            >
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(option.id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold">{option.name}</p>
                  {selected ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-ink-muted">{option.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {option.soundTraits.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full bg-cream px-2.5 py-1 text-[11px] text-ink-muted"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </button>

              {!unavailable[option.id] ? (
                <>
                  <button
                    type="button"
                    onClick={() => play(option.id)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary-soft"
                  >
                    <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Nghe thử
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
    </Card>
  );
}
