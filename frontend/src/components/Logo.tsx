import clsx from "clsx";

const chipSizes = {
  md: "h-9 w-9",
  lg: "h-14 w-14",
};

const imgSizes = {
  md: "h-7 w-7",
  lg: "h-11 w-11",
};

const textSizes = {
  md: "text-lg",
  lg: "text-xl",
};

export function Logo({
  className,
  mark = false,
  size = "md",
}: {
  className?: string;
  mark?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      {/* The crest sits in a white circular chip so its detail stays legible
          on both the dark pine chrome and light surfaces. */}
      <span
        className={clsx(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-black/5",
          chipSizes[size],
        )}
      >
        <img
          src="/ndu-coop-logo.png"
          alt={mark ? "NDU Staff Consumer Cooperative Society logo" : ""}
          className={clsx("object-contain", imgSizes[size])}
        />
      </span>
      {!mark && (
        <span
          className={clsx(
            "font-display font-semibold tracking-tight text-sand-900 dark:text-sand-50",
            textSizes[size],
          )}
        >
          NDU Cooperative
        </span>
      )}
    </div>
  );
}
