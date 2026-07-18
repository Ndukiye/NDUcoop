import { useState, type ReactNode } from "react";
import { DataTable, type Column } from "../../components/Table";
import { Modal } from "../../components/Modal";
import { Button } from "../../components/Button";
import { Textarea } from "../../components/Textarea";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/format";

export interface ApprovableRow {
  id: number | string;
  status: string;
  decided_at?: string | null;
  decided_by?: string | null;
  decision_note?: string | null;
}

interface ApprovalQueueTableProps<T extends ApprovableRow> {
  rows: T[];
  isLoading?: boolean;
  columns: Column<T>[];
  canDecide: boolean;
  decidableStatus?: string;
  onApprove: (row: T, note: string) => unknown;
  onReject: (row: T, note: string) => unknown;
  isDeciding?: boolean;
  emptyState?: { title: string; description: string };
  renderDetails?: (row: T) => ReactNode;
  toolbar?: ReactNode;
}

export function ApprovalQueueTable<T extends ApprovableRow>({
  rows,
  isLoading,
  columns,
  canDecide,
  decidableStatus = "PENDING",
  onApprove,
  onReject,
  isDeciding,
  emptyState,
  renderDetails,
  toolbar,
}: ApprovalQueueTableProps<T>) {
  const [pending, setPending] = useState<{ row: T; mode: "APPROVE" | "REJECT" | "VIEW" } | null>(
    null,
  );
  const [note, setNote] = useState("");

  const allColumns: Column<T>[] = [
    ...columns,
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
      sortAccessor: (row) => row.status,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) =>
        canDecide && row.status === decidableStatus ? (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setNote("");
                setPending({ row, mode: "REJECT" });
              }}
            >
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setNote("");
                setPending({ row, mode: "APPROVE" });
              }}
            >
              Approve
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={() => setPending({ row, mode: "VIEW" })}>
              View
            </Button>
          </div>
        ),
    },
  ];

  return (
    <>
      <DataTable
        columns={allColumns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyState={emptyState}
        toolbar={toolbar}
      />

      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title={
          pending?.mode === "APPROVE"
            ? "Approve request"
            : pending?.mode === "REJECT"
              ? "Reject request"
              : "Request details"
        }
        footer={
          pending?.mode === "VIEW" ? (
            <Button variant="secondary" onClick={() => setPending(null)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button
                variant={pending?.mode === "REJECT" ? "danger" : "primary"}
                loading={isDeciding}
                onClick={async () => {
                  if (!pending) return;
                  if (pending.mode === "APPROVE") await onApprove(pending.row, note);
                  else if (pending.mode === "REJECT") await onReject(pending.row, note);
                  setPending(null);
                }}
              >
                {pending?.mode === "APPROVE" ? "Confirm approval" : "Confirm rejection"}
              </Button>
            </>
          )
        }
      >
        {pending?.mode === "VIEW" ? (
          <div className="flex flex-col gap-3 text-sm">
            {renderDetails?.(pending.row)}
            <div>
              <p className="text-xs text-sand-400">Status</p>
              <StatusBadge status={pending.row.status} />
            </div>
            {pending.row.decided_by && (
              <div>
                <p className="text-xs text-sand-400">Decided by</p>
                <p className="text-sand-800 dark:text-sand-100">
                  {pending.row.decided_by}
                  {pending.row.decided_at && ` · ${formatDateTime(pending.row.decided_at)}`}
                </p>
              </div>
            )}
            {pending.row.decision_note && (
              <div>
                <p className="text-xs text-sand-400">Decision note</p>
                <p className="text-sand-800 dark:text-sand-100">{pending.row.decision_note}</p>
              </div>
            )}
          </div>
        ) : (
          <Textarea
            label={pending?.mode === "REJECT" ? "Reason for rejection" : "Note (optional)"}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required={pending?.mode === "REJECT"}
          />
        )}
      </Modal>
    </>
  );
}
