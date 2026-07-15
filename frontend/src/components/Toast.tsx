import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Icon } from "./Icon";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  show: (toast: { tone: ToastTone; title: string; description?: string }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { icon: "check" | "x-circle" | "bell"; classes: string }> = {
  success: {
    icon: "check",
    classes:
      "border-pine-200 bg-pine-50 text-pine-800 dark:border-pine-800 dark:bg-pine-950/80 dark:text-pine-200",
  },
  error: {
    icon: "x-circle",
    classes:
      "border-brick-100 bg-brick-50 text-brick-700 dark:border-brick-700/50 dark:bg-brick-500/10 dark:text-brick-400",
  },
  info: {
    icon: "bell",
    classes:
      "border-sand-200 bg-white text-sand-800 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-100",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((toast: { tone: ToastTone; title: string; description?: string }) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, ...toast }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end">
          {toasts.map((t) => {
            const style = toneStyles[t.tone];
            return (
              <div
                key={t.id}
                className={clsx(
                  "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lifted transition-all",
                  style.classes,
                )}
              >
                <Icon name={style.icon} className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-xs opacity-90">{t.description}</p>}
                </div>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
