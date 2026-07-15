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
  return (
    <nav aria-label="Các bước thiết kế" className="mx-auto mb-6 max-w-[560px] px-2 sm:mb-8">
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          const reachable = step.id <= maxReachedStep;
          const connectorDone = step.id < currentStep;

          return (
            <li key={step.id} className="relative flex-1">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-1/2 top-[17px] h-[2px] w-full transition-colors ${
                    connectorDone ? 'bg-primary' : 'bg-primary-soft'
                  }`}
                />
              ) : null}

              <button
                type="button"
                onClick={() => reachable && onStepClick(step.id)}
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                className="relative z-10 mx-auto flex w-full flex-col items-center disabled:cursor-not-allowed"
              >
                <span
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all',
                    active
                      ? 'bg-primary text-white shadow-soft ring-4 ring-primary-soft'
                      : done
                        ? 'bg-primary text-white'
                        : 'bg-primary-soft text-primary',
                    reachable ? '' : 'opacity-65',
                  ].join(' ')}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden="true" /> : step.id}
                </span>
                <span
                  className={[
                    'mt-2 max-w-[78px] text-center text-[10px] font-medium leading-tight sm:text-xs',
                    active ? 'font-bold text-primary' : done ? 'text-primary' : 'text-ink-muted/55',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
