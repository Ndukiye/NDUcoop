import { useMemo, useState, type ReactNode } from "react";
import clsx from "clsx";
import { EmptyState } from "./EmptyState";
import { Icon } from "./Icon";
import { Pagination } from "./Pagination";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  sortAccessor?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyState?: { title: string; description: string };
  onRowClick?: (row: T) => void;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  pageSize?: number;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  skeletonRows = 5,
  emptyState,
  onRowClick,
  defaultSort,
  pageSize,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(
    defaultSort ?? null,
  );
  const [page, setPage] = useState(1);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortAccessor) return rows;
    const accessor = col.sortAccessor;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort, columns]);

  const pageCount = pageSize ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount);
  const visibleRows = pageSize
    ? sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedRows;

  function toggleSort(key: string) {
    setPage(1);
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: "desc" };
      if (current.dir === "desc") return { key, dir: "asc" };
      return null;
    });
  }

  if (!isLoading && rows.length === 0) {
    return (
      <EmptyState
        title={emptyState?.title ?? "Nothing here yet"}
        description={emptyState?.description ?? "There's no data to show yet."}
      />
    );
  }

  return (
    <>
    <div className="relative overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-soft dark:border-sand-800 dark:bg-sand-900">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-800/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-sand-500 dark:text-sand-400",
                    col.className,
                  )}
                >
                  {col.sortAccessor ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="flex items-center gap-1 hover:text-sand-800 dark:hover:text-sand-100"
                    >
                      {col.header}
                      <Icon
                        name="chevron-down"
                        className={clsx(
                          "h-3.5 w-3.5 transition-transform",
                          sort?.key === col.key
                            ? sort.dir === "asc"
                              ? "rotate-180 text-sand-700 dark:text-sand-200"
                              : "text-sand-700 dark:text-sand-200"
                            : "opacity-30",
                        )}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100 dark:divide-sand-800">
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5">
                        <div className="h-3.5 w-full max-w-[10rem] animate-pulse rounded bg-sand-100 dark:bg-sand-800" />
                      </td>
                    ))}
                  </tr>
                ))
              : visibleRows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={clsx(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-sand-50 dark:hover:bg-sand-800/60",
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={clsx(
                          "px-4 py-3.5 text-sand-800 dark:text-sand-100",
                          col.className,
                        )}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:!from-sand-900 sm:hidden"
      />
    </div>
    {pageSize && !isLoading && (
      <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
    )}
    </>
  );
}
