import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-pine-500 to-pine-700 text-white hover:from-pine-600 hover:to-pine-800 active:to-pine-900 shadow-soft disabled:from-pine-300 disabled:to-pine-300",
  secondary:
    "bg-sand-100 text-sand-900 hover:bg-sand-200 active:bg-sand-300 dark:bg-sand-800 dark:text-sand-100 dark:hover:bg-sand-700",
  ghost:
    "bg-transparent text-sand-700 hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-sand-800",
  danger:
    "bg-brick-600 text-white hover:bg-brick-700 active:bg-brick-700 shadow-soft disabled:bg-brick-100",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-lg gap-2",
  lg: "px-5 py-3 text-base rounded-lg gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-70",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
