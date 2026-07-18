import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/Button";
import { DataTable, type Column } from "../../components/Table";
import { TextField } from "../../components/TextField";
import { StatusBadge } from "../../components/StatusBadge";
import { Icon } from "../../components/Icon";
import { formatNaira, formatDate } from "../../lib/format";
import { fetchWithdrawals, type WithdrawalRequest, CURRENT_MEMBER_ID } from "./api";
import { RequestWithdrawalModal } from "./RequestWithdrawalModal";
import { GenerateReceiptButton } from "../shared/GenerateReceiptButton";

export function WithdrawalsMemberPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["withdrawals", "mine"],
    queryFn: () => fetchWithdrawals({ memberId: CURRENT_MEMBER_ID }),
  });

  const rows = useMemo(() => {
    const results = data?.results ?? [];
    if (!search.trim()) return results;
    const q = search.toLowerCase();
    return results.filter(
      (r) =>
        r.status.toLowerCase().includes(q) ||
        String(r.amount).includes(q) ||
        r.payout_account_number.includes(q) ||
        r.payout_bank_name.toLowerCase().includes(q),
    );
  }, [data, search]);

  const columns: Column<WithdrawalRequest>[] = [
    {
      key: "date",
      header: "Date",
      render: (r) => formatDate(r.submitted_at),
      className: "whitespace-nowrap md:min-w-[9.5rem]",
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
      key: "account",
      header: "Payout account",
      render: (r) => `${r.payout_bank_name} · ${r.payout_account_number}`,
      className: "hidden md:table-cell",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
      sortAccessor: (r) => r.status,
    },
    { key: "note", header: "Decision note", render: (r) => r.decision_note ?? "—", className: "hidden md:table-cell" },
    {
      key: "receipt",
      header: "Receipt",
      render: (r) => (r.status === "APPROVED" ? <GenerateReceiptButton /> : "—"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-sand-500 dark:text-sand-400">
            Apply for a withdrawal and track its approval.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Icon name="plus" className="h-4 w-4" /> Apply for a withdrawal
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        defaultSort={{ key: "date", dir: "desc" }}
        pageSize={10}
        toolbar={
          <TextField
            label="Search"
            hideLabel
            placeholder="Search status, amount, or account"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
          />
        }
        emptyState={{
          title: "No withdrawals yet",
          description: "Withdrawals you apply for will show up here.",
        }}
      />

      <RequestWithdrawalModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
