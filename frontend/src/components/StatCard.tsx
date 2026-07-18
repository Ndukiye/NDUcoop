import type { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent";
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={clsx(
        "flex flex-col gap-2 p-4 sm:gap-3 sm:p-5",
        tone === "accent" &&
          "border-pine-200 bg-gradient-to-br from-pine-50 to-gold-50 dark:border-pine-800 dark:!from-pine-950/50 dark:!to-gold-900/20",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-sand-500 dark:text-sand-400 sm:text-sm">
          {label}
        </span>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-300">
            {icon}
          </span>
        )}
      </div>
      <span className="min-w-0 text-xl font-semibold tabular-nums tracking-tight text-sand-900 dark:text-sand-50 sm:text-[1.75rem] sm:leading-9">
        {value}
      </span>
      {hint && <span className="text-xs text-sand-400">{hint}</span>}
    </Card>
  );
}
