import { type InputHTMLAttributes, forwardRef, useId } from "react";
import clsx from "clsx";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hideLabel?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, className, id, hideLabel, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className={clsx("flex flex-col", !hideLabel && "gap-1.5")}>
        <label
          htmlFor={inputId}
          className={clsx(
            "text-sm font-medium text-sand-700 dark:text-sand-300",
            hideLabel && "sr-only",
          )}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "rounded-lg border bg-sand-25 dark:bg-sand-900 px-3.5 py-2.5 text-sm text-sand-900 dark:text-sand-100",
            "border-sand-200 dark:border-sand-700 placeholder:text-sand-400",
            "transition-shadow duration-150",
            "focus:outline-none focus:ring-2 focus:ring-pine-400 focus:border-pine-500",
            error && "border-brick-400 focus:ring-brick-400 focus:border-brick-500",
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-brick-600">{error}</span>}
      </div>
    );
  },
);
TextField.displayName = "TextField";
