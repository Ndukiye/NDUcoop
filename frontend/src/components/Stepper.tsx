import clsx from "clsx";
import { Icon } from "./Icon";

export function Stepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isDone
                    ? "bg-gradient-to-br from-pine-500 to-pine-700 text-white"
                    : isCurrent
                      ? "bg-gold-400 text-pine-950"
                      : "bg-sand-100 text-sand-400 dark:bg-sand-800 dark:text-sand-500",
                )}
              >
                {isDone ? <Icon name="check" className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={clsx(
                  "hidden text-xs font-medium sm:block",
                  isCurrent ? "text-sand-900 dark:text-sand-50" : "text-sand-400",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={clsx(
                  "mx-2 h-px flex-1",
                  isDone ? "bg-pine-400" : "bg-sand-200 dark:bg-sand-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
