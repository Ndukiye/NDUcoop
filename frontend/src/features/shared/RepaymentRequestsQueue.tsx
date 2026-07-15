import type { Column } from "../../components/Table";
import { ApprovalQueueTable } from "./ApprovalQueueTable";
import { ReceiptButton } from "./ReceiptButton";
import { formatNaira, formatDate } from "../../lib/format";

export interface EnrichedRepaymentRequest {
  id: number;
  member_name: string;
  amount: string;
  receipt_filename: string | null;
  note: string;
  status: string;
  submitted_at: string;
  decided_at?: string | null;
  decided_by?: string | null;
  decision_note?: string | null;
}

export function RepaymentRequestsQueue({
  rows,
  isLoading,
  canDecide,
  isDeciding,
  onApprove,
  onReject,
}: {
  rows: EnrichedRepaymentRequest[];
  isLoading: boolean;
  canDecide: boolean;
  isDeciding: boolean;
  onApprove: (row: EnrichedRepaymentRequest, note: string) => unknown;
  onReject: (row: EnrichedRepaymentRequest, note: string) => unknown;
}) {
  const columns: Column<EnrichedRepaymentRequest>[] = [
    { key: "member", header: "Member", render: (r) => r.member_name, sortAccessor: (r) => r.member_name },
    {
      key: "date",
      header: "Submitted",
      render: (r) => formatDate(r.submitted_at),
      className: "hidden whitespace-nowrap md:table-cell md:min-w-[9.5rem]",
      sortAccessor: (r) => Date.parse(r.submitted_at),
    },
    {
      key: "amount",
      header: "Amount",
      render: (r) => formatNaira(r.amount),
      className: "text-right",
      sortAccessor: (r) => Number(r.amount),
    },
    {
      key: "receipt",
      header: "Receipt",
      className: "hidden md:table-cell",
      render: (r) => <ReceiptButton filename={r.receipt_filename} />,
    },
  ];

  return (
    <ApprovalQueueTable
      rows={rows}
      isLoading={isLoading}
      columns={columns}
      canDecide={canDecide}
      isDeciding={isDeciding}
      onApprove={onApprove}
      onReject={onReject}
      renderDetails={(row) => (
        <>
          <div>
            <p className="text-xs text-sand-400">Member</p>
            <p className="text-sand-800 dark:text-sand-100">{row.member_name}</p>
          </div>
          <div>
            <p className="text-xs text-sand-400">Amount</p>
            <p className="text-sand-800 dark:text-sand-100">{formatNaira(row.amount)}</p>
          </div>
          {row.note && (
            <div>
              <p className="text-xs text-sand-400">Member's note</p>
              <p className="text-sand-800 dark:text-sand-100">{row.note}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-sand-400">Receipt</p>
            <ReceiptButton filename={row.receipt_filename} />
          </div>
        </>
      )}
      emptyState={{
        title: "No repayment requests",
        description: "Manual repayment requests will appear here.",
      }}
    />
  );
}
