import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Icon } from "./Icon";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-sand-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          "relative max-h-[90vh] w-full rounded-2xl border border-sand-200 bg-white shadow-lifted dark:border-sand-800 dark:bg-sand-900",
          sizeClasses[size],
        )}
      >
        <div className="flex items-center justify-between border-b border-sand-100 px-6 py-4 dark:border-sand-800">
          <h2 className="font-display text-lg font-semibold text-sand-900 dark:text-sand-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-sand-400 hover:bg-sand-100 hover:text-sand-700 dark:hover:bg-sand-800 dark:hover:text-sand-200"
            aria-label="Close"
          >
            <Icon name="close" className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="max-h-[calc(90vh-8.5rem)] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-sand-100 px-6 py-4 dark:border-sand-800">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
