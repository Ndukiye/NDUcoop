import type { HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "pine" | "gold" | "brick" | "sand";

const toneClasses: Record<Tone, string> = {
  pine: "bg-pine-100 text-pine-800 dark:bg-pine-900/50 dark:text-pine-200",
  gold: "bg-gold-100 text-gold-800 dark:bg-gold-900/40 dark:text-gold-200",
  brick: "bg-brick-100 text-brick-700 dark:bg-brick-500/20 dark:text-brick-400",
  sand: "bg-sand-100 text-sand-700 dark:bg-sand-800 dark:text-sand-300",
};

export function Badge({
  tone = "sand",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
