import { type TextareaHTMLAttributes, forwardRef, useId } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-sm font-medium text-sand-700 dark:text-sand-300">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={clsx(
            "resize-none rounded-lg border bg-sand-25 dark:bg-sand-900 px-3.5 py-2.5 text-sm text-sand-900 dark:text-sand-100",
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
Textarea.displayName = "Textarea";
