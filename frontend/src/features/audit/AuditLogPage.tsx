import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select } from "../../components/Select";
import { TextField } from "../../components/TextField";
import { DataTable, type Column } from "../../components/Table";
import { Modal } from "../../components/Modal";
import { Avatar } from "../../components/Avatar";
import { Pagination } from "../../components/Pagination";
import { formatDateTime } from "../../lib/format";
import { fetchAuditLog, auditActions, AUDIT_ACTION_LABELS, type AuditEntry } from "./api";

const actionLabels = AUDIT_ACTION_LABELS;

export function AuditLogPage() {
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<AuditEntry | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["audit", { action, search, page }],
    queryFn: () => fetchAuditLog({ action: action || undefined, search: search || undefined, page }),
  });

  const columns: Column<AuditEntry>[] = [
    {
      key: "date",
      header: "Date",
      render: (e) => formatDateTime(e.created_at),
      className: "whitespace-nowrap md:min-w-[9.5rem]",
      sortAccessor: (e) => Date.parse(e.created_at),
    },
    {
      key: "actor",
      header: "Actor",
      render: (e) => (
        <div className="flex items-center gap-2.5">
          <Avatar
            firstName={e.actor_name.split(" ")[0]}
            lastName={e.actor_name.split(" ")[1]}
            size="sm"
          />
          <div>
            <p className="text-sand-900 dark:text-sand-50">{e.actor_name}</p>
            <p className="text-xs text-sand-500 dark:text-sand-400">{e.actor_role}</p>
          </div>
        </div>
      ),
    },
    { key: "action", header: "Action", render: (e) => actionLabels[e.action] ?? e.action },
    { key: "target", header: "Target member", render: (e) => e.target_member_name ?? "—", className: "hidden md:table-cell" },
    {
      key: "reason",
      header: "Reason",
      className: "hidden md:table-cell",
      render: (e) => (
        <span className="line-clamp-1 max-w-xs text-sand-600 dark:text-sand-300">
          {e.reason || "—"}
        </span>
      ),
    },
  ];

  const pageCount = data ? Math.max(1, Math.ceil(data.count / 10)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-sand-500 dark:text-sand-400">
            Every admin action on member money, with before/after detail.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.results ?? []}
        rowKey={(e) => e.id}
        isLoading={isLoading}
        onRowClick={(e) => setViewing(e)}
        toolbar={
          <>
            <TextField
              label="Search"
              hideLabel
              placeholder="Search actor, target member, or reason"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-72"
            />
            <div className="w-full sm:w-56">
              <Select
                label="Action"
                hideLabel
                options={[
                  { value: "", label: "All actions" },
                  ...auditActions.map((a) => ({ value: a, label: actionLabels[a] ?? a })),
                ]}
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </>
        }
        footer={<Pagination page={page} pageCount={pageCount} onPageChange={setPage} />}
        emptyState={{
          title: "No audit entries",
          description: "There are no audit log entries matching this filter.",
        }}
      />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Audit entry detail" size="lg">
        {viewing && (
          <div className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-sand-400">Actor</p>
                <p className="text-sand-800 dark:text-sand-100">
                  {viewing.actor_name} ({viewing.actor_role})
                </p>
              </div>
              <div>
                <p className="text-xs text-sand-400">Date</p>
                <p className="text-sand-800 dark:text-sand-100">
                  {formatDateTime(viewing.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-sand-400">Action</p>
                <p className="text-sand-800 dark:text-sand-100">
                  {actionLabels[viewing.action] ?? viewing.action}
                </p>
              </div>
              <div>
                <p className="text-xs text-sand-400">Target member</p>
                <p className="text-sand-800 dark:text-sand-100">
                  {viewing.target_member_name ?? "—"}
                </p>
              </div>
            </div>
            {viewing.reason && (
              <div>
                <p className="text-xs text-sand-400">Reason</p>
                <p className="text-sand-800 dark:text-sand-100">{viewing.reason}</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs font-medium text-sand-400">Before</p>
                <pre className="overflow-x-auto rounded-lg border border-sand-200 bg-sand-50 p-3 text-xs text-sand-700 dark:border-sand-700 dark:bg-sand-800 dark:text-sand-200">
                  {viewing.previous_value ? JSON.stringify(viewing.previous_value, null, 2) : "null"}
                </pre>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-sand-400">After</p>
                <pre className="overflow-x-auto rounded-lg border border-pine-200 bg-pine-50 p-3 text-xs text-pine-800 dark:border-pine-800 dark:bg-pine-950/40 dark:text-pine-200">
                  {viewing.new_value ? JSON.stringify(viewing.new_value, null, 2) : "null"}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
