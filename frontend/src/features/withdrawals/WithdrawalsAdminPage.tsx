import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Select } from "../../components/Select";
import { TextField } from "../../components/TextField";
import type { Column } from "../../components/Table";
import { formatNaira, formatDate } from "../../lib/format";
import type { ApprovalStatus } from "../../lib/types";
import { useToast } from "../../components/Toast";
import { useAuthStore } from "../../store/auth";
import { isFullAdmin } from "../../lib/roles";
import { ApprovalQueueTable } from "../shared/ApprovalQueueTable";
import { fetchWithdrawals, decideWithdrawal, type WithdrawalRequest } from "./api";

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "", label: "All statuses" },
];

export function WithdrawalsAdminPage() {
  const [status, setStatus] = useState<ApprovalStatus | "">("PENDING");
  const [search, setSearch] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ["withdrawals", "admin", status],
    queryFn: () => fetchWithdrawals({ status: status || undefined }),
  });

  const rows = useMemo(() => {
    const results = data?.results ?? [];
    if (!search.trim()) return results;
    const q = search.toLowerCase();
    return results.filter(
      (r) => r.member_name.toLowerCase().includes(q) || r.payout_account_number.includes(q),
    );
  }, [data, search]);

  const decideMutation = useMutation({
    mutationFn: ({ id, decision, note }: { id: number; decision: "APPROVE" | "REJECT"; note: string }) =>
      decideWithdrawal(id, decision, note),
    onSuccess: (_, vars) => {
      toast.show({
        tone: vars.decision === "APPROVE" ? "success" : "info",
        title: vars.decision === "APPROVE" ? "Withdrawal approved" : "Withdrawal rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });

  const columns: Column<WithdrawalRequest>[] = [
    {
      key: "member",
      header: "Member",
      render: (r) => r.member_name,
      sortAccessor: (r) => r.member_name,
    },
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
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-sand-500 dark:text-sand-400">
            Review and decide on member withdrawal requests.
          </p>
        </div>
      </div>

      <ApprovalQueueTable
        rows={rows}
        isLoading={isLoading}
        columns={columns}
        toolbar={
          <>
            <TextField
              label="Search"
              hideLabel
              placeholder="Search member or account number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72"
            />
            <div className="w-full sm:w-48">
              <Select
                label="Status"
                hideLabel
                options={statusOptions}
                value={status}
                onChange={(e) => setStatus(e.target.value as ApprovalStatus | "")}
              />
            </div>
          </>
        }
        canDecide={isFullAdmin(role)}
        isDeciding={decideMutation.isPending}
        onApprove={(row, note) =>
          decideMutation.mutateAsync({ id: row.id, decision: "APPROVE", note })
        }
        onReject={(row, note) =>
          decideMutation.mutateAsync({ id: row.id, decision: "REJECT", note })
        }
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
            <div>
              <p className="text-xs text-sand-400">Payout account</p>
              <p className="text-sand-800 dark:text-sand-100">
                {row.payout_bank_name} · {row.payout_account_name} · {row.payout_account_number}
              </p>
            </div>
            {row.note && (
              <div>
                <p className="text-xs text-sand-400">Member's note</p>
                <p className="text-sand-800 dark:text-sand-100">{row.note}</p>
              </div>
            )}
          </>
        )}
        emptyState={{
          title: "No withdrawal requests",
          description: "There are no withdrawal requests matching this filter.",
        }}
      />
    </div>
  );
}
