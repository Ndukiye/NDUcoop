import { type SelectHTMLAttributes, forwardRef, useId } from "react";
import clsx from "clsx";
import { Icon } from "./Icon";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-sand-700 dark:text-sand-300">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              "w-full appearance-none rounded-lg border bg-sand-25 dark:bg-sand-900 px-3.5 py-2.5 pr-9 text-sm text-sand-900 dark:text-sand-100",
              "border-sand-200 dark:border-sand-700",
              "transition-shadow duration-150",
              "focus:outline-none focus:ring-2 focus:ring-pine-400 focus:border-pine-500",
              error && "border-brick-400 focus:ring-brick-400 focus:border-brick-500",
              className,
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Icon
            name="chevron-down"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-400"
          />
        </div>
        {error && <span className="text-xs text-brick-600">{error}</span>}
      </div>
    );
  },
);
Select.displayName = "Select";
