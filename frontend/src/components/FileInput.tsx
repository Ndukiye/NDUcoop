import { type InputHTMLAttributes, forwardRef, useId, useState } from "react";
import clsx from "clsx";
import { Icon } from "./Icon";

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label: string;
  error?: string;
  onFileChange?: (file: File | null) => void;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ label, error, className, id, onFileChange, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [fileName, setFileName] = useState<string | null>(null);

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-sand-700 dark:text-sand-300">
          {label}
        </label>
        <label
          htmlFor={inputId}
          className={clsx(
            "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3.5 py-3 text-sm transition-colors",
            "border-sand-300 bg-sand-25 hover:bg-sand-50 dark:border-sand-600 dark:bg-sand-900 dark:hover:bg-sand-800",
            error && "border-brick-400",
            className,
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sand-500 dark:bg-sand-800 dark:text-sand-300">
            <Icon name="file" className="h-4 w-4" />
          </span>
          <span
            className={clsx(
              "truncate",
              fileName ? "text-sand-800 dark:text-sand-100" : "text-sand-400",
            )}
          >
            {fileName ?? "Choose a receipt image or PDF to upload"}
          </span>
          <input
            ref={ref}
            id={inputId}
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setFileName(file?.name ?? null);
              onFileChange?.(file);
            }}
            {...props}
          />
        </label>
        {error && <span className="text-xs text-brick-600">{error}</span>}
      </div>
    );
  },
);
FileInput.displayName = "FileInput";
