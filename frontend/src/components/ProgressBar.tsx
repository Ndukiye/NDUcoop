import clsx from "clsx";

const toneClasses = {
  pine: "bg-gradient-to-r from-pine-500 to-pine-600",
  gold: "bg-gradient-to-r from-gold-400 to-gold-500",
  brick: "bg-gradient-to-r from-brick-400 to-brick-500",
};

export function ProgressBar({
  value,
  max,
  tone = "pine",
  className,
}: {
  value: number;
  max: number;
  tone?: "pine" | "gold" | "brick";
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={clsx(
        "h-2 w-full overflow-hidden rounded-full bg-sand-100 dark:bg-sand-800",
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={clsx("h-full rounded-full transition-[width] duration-300", toneClasses[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
