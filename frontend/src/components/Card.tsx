import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-sand-200 bg-white shadow-soft dark:border-sand-800 dark:bg-sand-900",
        className,
      )}
      {...props}
    />
  );
}
