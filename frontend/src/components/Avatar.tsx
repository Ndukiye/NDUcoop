import clsx from "clsx";

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({
  firstName,
  lastName,
  size = "md",
  className,
}: {
  firstName?: string;
  lastName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 font-semibold text-pine-950",
        sizeClasses[size],
        className,
      )}
    >
      {initials(firstName, lastName)}
    </div>
  );
}
