import { Check } from 'lucide-react';

export interface Step {
  id: number;
  label: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  /** Bước cao nhất khách đã mở khoá — không cho nhảy cóc quá xa. */
  maxReachedStep: number;
}

export default function StepProgress({
  steps,
  currentStep,
  onStepClick,
  maxReachedStep,
}: StepProgressProps) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="card-surface p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-sm font-medium text-ink">
          Bước {currentStep}/{steps.length}
        </p>
        <p className="font-display text-base font-semibold text-primary">
          {steps[currentStep - 1]?.label}
        </p>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-soft">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label={`Tiến trình: bước ${currentStep} trên ${steps.length}`}
        />
      </div>

      <ol className="mt-4 hidden gap-2 sm:grid sm:grid-cols-5">
        {steps.map((step) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          const reachable = step.id <= maxReachedStep;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => reachable && onStepClick(step.id)}
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                className={[
                  'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors',
                  reachable ? 'hover:bg-primary-soft/60' : 'cursor-not-allowed opacity-45',
                  active ? 'bg-primary-soft' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                    done
                      ? 'bg-primary text-white'
                      : active
                        ? 'border-2 border-primary text-primary'
                        : 'border border-line text-ink-muted',
                  ].join(' ')}
                >
                  {done ? <Check className="h-3 w-3" aria-hidden="true" /> : step.id}
                </span>
                <span className={active ? 'font-medium text-primary' : 'text-ink-muted'}>
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
