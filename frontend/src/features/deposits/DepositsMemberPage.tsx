import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/Button";
import { DataTable, type Column } from "../../components/Table";
import { TextField } from "../../components/TextField";
import { StatusBadge } from "../../components/StatusBadge";
import { Icon } from "../../components/Icon";
import { formatNaira, formatDate } from "../../lib/format";
import { fetchDeposits, type DepositRequest, CURRENT_MEMBER_ID } from "./api";
import { RequestDepositModal } from "./RequestDepositModal";
import { ReceiptButton } from "../shared/ReceiptButton";

export function DepositsMemberPage() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["deposits", "mine"],
    queryFn: () => fetchDeposits({ memberId: CURRENT_MEMBER_ID }),
  });

  const rows = useMemo(() => {
    const results = data?.results ?? [];
    if (!search.trim()) return results;
    const q = search.toLowerCase();
    return results.filter(
      (r) => r.status.toLowerCase().includes(q) || String(r.amount).includes(q),
    );
  }, [data, search]);

  const columns: Column<DepositRequest>[] = [
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
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
      sortAccessor: (r) => r.status,
    },
    { key: "note", header: "Decision note", render: (r) => r.decision_note ?? "—", className: "hidden md:table-cell" },
    {
      key: "receipt",
      header: "Receipt",
      render: (r) => <ReceiptButton filename={r.receipt_filename} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-sand-500 dark:text-sand-400">
            Make a deposit and track its approval.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Icon name="plus" className="h-4 w-4" /> Make a deposit
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
            placeholder="Search status or amount"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
          />
        }
        emptyState={{
          title: "No deposits yet",
          description: "Deposits you make will show up here.",
        }}
      />

      <RequestDepositModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
