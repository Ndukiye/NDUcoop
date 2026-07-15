import { useState, type MouseEvent } from "react";
import clsx from "clsx";
import { Icon } from "./Icon";

const toneClasses = {
  default:
    "text-sand-400 hover:bg-sand-100 hover:text-sand-700 dark:hover:bg-sand-800 dark:hover:text-sand-200",
  "on-dark": "text-pine-300 hover:bg-white/10 hover:text-white",
};

const copiedToneClasses = {
  default: "text-pine-600 dark:text-pine-400",
  "on-dark": "text-gold-300",
};

export function CopyButton({
  value,
  tone = "default",
  className,
}: {
  value: string;
  tone?: "default" | "on-dark";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) -- nothing else to do here.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : `Copy ${value}`}
      className={clsx(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors",
        copied ? copiedToneClasses[tone] : toneClasses[tone],
        className,
      )}
    >
      <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
    </button>
  );
}
