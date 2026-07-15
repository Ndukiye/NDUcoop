import { Icon } from "./Icon";

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <span className="text-sm text-sand-500 dark:text-sand-400">
        Page {page} of {pageCount}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-sand-200 text-sand-600 hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-sand-700 dark:text-sand-300 dark:hover:bg-sand-800"
          aria-label="Previous page"
        >
          <Icon name="chevron-down" className="h-4 w-4 rotate-90" />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-sand-200 text-sand-600 hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-sand-700 dark:text-sand-300 dark:hover:bg-sand-800"
          aria-label="Next page"
        >
          <Icon name="chevron-down" className="h-4 w-4 -rotate-90" />
        </button>
      </div>
    </div>
  );
}
