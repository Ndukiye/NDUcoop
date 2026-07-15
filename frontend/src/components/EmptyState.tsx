import type { ReactNode } from "react";
import { Card } from "./Card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="mb-1 h-10 w-10 rounded-full border-2 border-dashed border-sand-300 dark:border-sand-700" />
      <p className="font-display text-base font-medium text-sand-800 dark:text-sand-100">
        {title}
      </p>
      <p className="max-w-sm text-sm text-sand-500 dark:text-sand-400">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </Card>
  );
}
