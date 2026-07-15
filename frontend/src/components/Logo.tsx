import clsx from "clsx";

export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        className="shrink-0"
        aria-hidden="true"
      >
        <circle cx="15" cy="15" r="15" className="fill-pine-600" />
        <path
          d="M9 19.5V10.5L21 19.5V10.5"
          stroke="var(--color-gold-300)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {!mark && (
        <span className="font-display text-lg font-semibold tracking-tight text-sand-900 dark:text-sand-50">
          NDU Cooperative
        </span>
      )}
    </div>
  );
}
