export interface Step {
  id: number;
  label: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  maxReachedStep: number;
}

export default function StepProgress({
  steps,
  currentStep,
  onStepClick,
  maxReachedStep,
}: StepProgressProps) {
  return (
    <nav aria-label="Các bước thiết kế" className="mx-auto mb-6 max-w-[620px] px-2 sm:mb-8">
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          const reachable = step.id <= maxReachedStep;
          const filled = done || active;

          return (
            <li key={step.id} className="relative flex-1">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-1/2 top-[17px] h-[2px] w-full ${filled ? 'bg-primary' : 'bg-primary-soft'}`}
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
                      ? 'bg-primary text-white ring-4 ring-primary-soft'
                      : done
                        ? 'bg-primary text-white'
                        : 'bg-primary-soft text-primary/60',
                    reachable ? '' : 'opacity-60',
                  ].join(' ')}
                >
                  {step.id}
                </span>
                <span
                  className={[
                    'mt-2 max-w-[86px] text-center text-[10px] font-semibold leading-tight sm:text-xs',
                    active ? 'text-primary' : done ? 'text-brandPurple' : 'text-ink-muted/55',
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
