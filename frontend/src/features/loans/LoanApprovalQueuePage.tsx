import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../../components/Card";
import { ProgressBar } from "../../components/ProgressBar";
import { StatusBadge } from "../../components/StatusBadge";
import { Badge } from "../../components/Badge";
import { TextField } from "../../components/TextField";
import type { Column } from "../../components/Table";
import { useToast } from "../../components/Toast";
import { useAuthStore } from "../../store/auth";
import { isFullAdmin } from "../../lib/roles";
import { formatNaira } from "../../lib/format";
import { ApprovalQueueTable } from "../shared/ApprovalQueueTable";
import { RepaymentRequestsQueue } from "../shared/RepaymentRequestsQueue";
import { guarantorRequestsForLoan } from "../../mocks/guarantors";
import {
  fetchLoanApplications,
  decideLoanApplication,
  fetchLoanRepaymentQueue,
  decideLoanRepaymentRequest,
  type LoanWithMember,
} from "./api";

export function LoanApprovalQueuePage() {
  const [search, setSearch] = useState("");
  const [repaymentSearch, setRepaymentSearch] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);

  const { data: pending, isLoading } = useQuery({
    queryKey: ["loans", "admin", "PENDING_ADMIN_APPROVAL"],
    queryFn: () => fetchLoanApplications({ status: "PENDING_ADMIN_APPROVAL" }),
  });

  const pendingRows = useMemo(() => {
    const results = pending?.results ?? [];
    if (!search.trim()) return results;
    const q = search.toLowerCase();
    return results.filter((l) => l.member_name.toLowerCase().includes(q));
  }, [pending, search]);

  const { data: active } = useQuery({
    queryKey: ["loans", "admin", "ACTIVE"],
    queryFn: () => fetchLoanApplications({ status: "ACTIVE" }),
  });

  const { data: repaymentRequests, isLoading: repaymentRequestsLoading } = useQuery({
    queryKey: ["loans", "repayment-queue"],
    queryFn: fetchLoanRepaymentQueue,
  });

  const repaymentRows = useMemo(() => {
    const results = repaymentRequests ?? [];
    if (!repaymentSearch.trim()) return results;
    const q = repaymentSearch.toLowerCase();
    return results.filter((r) => r.member_name.toLowerCase().includes(q));
  }, [repaymentRequests, repaymentSearch]);

  const decideMutation = useMutation({
    mutationFn: ({ id, decision, note }: { id: number; decision: "APPROVE" | "REJECT"; note: string }) =>
      decideLoanApplication(id, decision, note),
    onSuccess: (_, vars) => {
      toast.show({
        tone: vars.decision === "APPROVE" ? "success" : "info",
        title: vars.decision === "APPROVE" ? "Loan approved" : "Loan rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });

  const decideRepaymentMutation = useMutation({
    mutationFn: ({ id, decision, note }: { id: number; decision: "APPROVE" | "REJECT"; note: string }) =>
      decideLoanRepaymentRequest(id, decision, note),
    onSuccess: (_, vars) => {
      toast.show({
        tone: vars.decision === "APPROVE" ? "success" : "info",
        title: vars.decision === "APPROVE" ? "Repayment approved" : "Repayment rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });

  const columns: Column<LoanWithMember>[] = [
    { key: "member", header: "Member", render: (l) => l.member_name },
    { key: "product", header: "Product", render: (l) => l.product_name, className: "hidden md:table-cell" },
    {
      key: "principal",
      header: "Principal",
      render: (l) => formatNaira(l.principal_granted),
      className: "text-right",
    },
    {
      key: "rate",
      header: "Rate",
      render: (l) => `${l.interest_rate_applied}%${l.is_interest_override ? " (override)" : ""}`,
    },
    {
      key: "guarantors",
      header: "Guarantors",
      render: (l) => {
        const reqs = guarantorRequestsForLoan(l.id);
        const accepted = reqs.filter((r) => r.status === "ACCEPTED").length;
        const total = reqs.length || 2;
        return (
          <Badge tone={accepted === total ? "pine" : "gold"}>
            {accepted}/{total} accepted
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-sand-500 dark:text-sand-400">
          Review loan applications and monitor active repayments.
        </p>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-sand-500 dark:text-sand-400">Pending approval</p>
          <TextField
            label="Search"
            placeholder="Member name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-56"
          />
        </div>
        <ApprovalQueueTable
          rows={pendingRows}
          isLoading={isLoading}
          columns={columns}
          canDecide
          decidableStatus="PENDING_ADMIN_APPROVAL"
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
                <p className="text-xs text-sand-400">Product</p>
                <p className="text-sand-800 dark:text-sand-100">{row.product_name}</p>
              </div>
              <div>
                <p className="text-xs text-sand-400">Principal</p>
                <p className="text-sand-800 dark:text-sand-100">
                  {formatNaira(row.principal_granted)}
                </p>
              </div>
            </>
          )}
          emptyState={{
            title: "No pending loans",
            description: "Loan applications awaiting your approval will appear here.",
          }}
        />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-sand-500 dark:text-sand-400">
            Repayment requests
          </p>
          <TextField
            label="Search"
            placeholder="Member name"
            value={repaymentSearch}
            onChange={(e) => setRepaymentSearch(e.target.value)}
            className="sm:w-56"
          />
        </div>
        <RepaymentRequestsQueue
          rows={repaymentRows}
          isLoading={repaymentRequestsLoading}
          canDecide={isFullAdmin(role)}
          isDeciding={decideRepaymentMutation.isPending}
          onApprove={(row, note) =>
            decideRepaymentMutation.mutateAsync({ id: row.id, decision: "APPROVE", note })
          }
          onReject={(row, note) =>
            decideRepaymentMutation.mutateAsync({ id: row.id, decision: "REJECT", note })
          }
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">Active loans</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active?.results.map((loan) => {
            const paid = Number(loan.principal_granted) - Number(loan.outstanding_balance);
            return (
              <Card key={loan.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sand-900 dark:text-sand-50">{loan.member_name}</p>
                  <StatusBadge status={loan.status} />
                </div>
                <p className="text-sm text-sand-500 dark:text-sand-400">
                  {loan.product_name} &middot; {formatNaira(loan.principal_granted)}
                </p>
                <ProgressBar value={paid} max={Number(loan.principal_granted)} />
                <p className="text-xs text-sand-400">
                  {formatNaira(loan.outstanding_balance)} outstanding
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
