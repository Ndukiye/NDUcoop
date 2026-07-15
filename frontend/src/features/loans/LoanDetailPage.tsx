import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../../components/Card";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { DataTable, type Column } from "../../components/Table";
import { EmptyState } from "../../components/EmptyState";
import { useToast } from "../../components/Toast";
import { formatNaira, formatDate } from "../../lib/format";
import {
  fetchLoan,
  fetchLoanGuarantors,
  submitLoanRepaymentRequest,
  fetchLoanRepaymentRequestsForLoan,
} from "./api";
import { RepaymentRequestModal } from "../shared/RepaymentRequestModal";
import { GenerateReceiptButton } from "../shared/GenerateReceiptButton";
import { findMember } from "../../mocks/members";
import type { MockRepayment } from "../../mocks/loans";
import type { MockGuarantorRequest } from "../../mocks/guarantors";
import type { EnrichedRepaymentRequest } from "../shared/RepaymentRequestsQueue";

export function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loanId = Number(id);
  const [repayOpen, setRepayOpen] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: loan, isLoading } = useQuery({
    queryKey: ["loans", loanId],
    queryFn: () => fetchLoan(loanId),
  });

  const { data: guarantors } = useQuery({
    queryKey: ["guarantors", "loan", loanId],
    queryFn: () => fetchLoanGuarantors(loanId),
    enabled: !!loan,
  });

  const { data: repaymentRequests, isLoading: repaymentRequestsLoading } = useQuery({
    queryKey: ["loans", "repayment-requests", loanId],
    queryFn: () => fetchLoanRepaymentRequestsForLoan(loanId),
    enabled: !!loan,
  });

  const repayMutation = useMutation({
    mutationFn: (input: { amount: string; note: string; receiptFilename: string }) =>
      submitLoanRepaymentRequest({ loanId, ...input }),
    onSuccess: () => {
      toast.show({
        tone: "success",
        title: "Repayment submitted",
        description: "An admin will review your receipt shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      setRepayOpen(false);
    },
  });

  const repaymentColumns: Column<MockRepayment>[] = [
    {
      key: "date",
      header: "Date",
      render: (r) => formatDate(r.paid_at),
      className: "whitespace-nowrap md:min-w-[9.5rem]",
      sortAccessor: (r) => Date.parse(r.paid_at),
    },
    {
      key: "amount",
      header: "Amount",
      render: (r) => formatNaira(r.amount),
      className: "text-right",
      sortAccessor: (r) => Number(r.amount),
    },
    { key: "type", header: "Type", render: (r) => (r.is_manual ? "Manual" : "Salary deduction"), className: "hidden md:table-cell" },
    { key: "receipt", header: "Receipt", render: () => <GenerateReceiptButton /> },
  ];

  const requestColumns: Column<EnrichedRepaymentRequest>[] = [
    {
      key: "date",
      header: "Submitted",
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
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (!isLoading && !loan) {
    return (
      <EmptyState
        title="Loan not found"
        description="This loan may have been removed."
        action={
          <Button variant="secondary" onClick={() => navigate("/loans")}>
            Back to loans
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate("/loans")}
        className="flex items-center gap-1.5 text-sm font-medium text-sand-500 hover:text-sand-800 dark:text-sand-400 dark:hover:text-sand-100"
      >
        <Icon name="chevron-down" className="h-4 w-4 rotate-90" />
        Back to loans
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-medium text-sand-900 dark:text-sand-50">
            {loan?.product_name ?? "Loading…"}
          </h2>
          {loan && <StatusBadge status={loan.status} />}
        </div>
        {loan && (loan.status === "ACTIVE" || loan.status === "COMPLETED") && (
          <div className="flex flex-wrap gap-2">
            <GenerateReceiptButton label="Disbursement receipt" iconOnlyOnMobile={false} />
            {loan.status === "ACTIVE" && (
              <>
                <Button onClick={() => setRepayOpen(true)}>
                  <Icon name="arrow-up" className="h-4 w-4" /> Make a repayment
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/loans/apply", { state: { topUpOfLoanId: loan.id } })}
                >
                  <Icon name="plus" className="h-4 w-4" /> Top up this loan
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Principal"
          value={formatNaira(loan?.principal_granted ?? 0)}
          tone="accent"
          className="col-span-2 lg:col-span-1"
        />
        <StatCard label="Outstanding balance" value={formatNaira(loan?.outstanding_balance ?? 0)} />
        <StatCard label="Monthly repayment" value={formatNaira(loan?.monthly_repayment_amount ?? 0)} />
        <StatCard
          label="Interest rate"
          value={loan ? `${loan.interest_rate_applied}%` : "—"}
          hint={loan?.is_interest_override ? "High-risk override applied" : undefined}
        />
      </div>

      <Card className="p-5">
        <p className="mb-4 text-sm font-medium text-sand-500 dark:text-sand-400">Guarantors</p>
        {guarantors && guarantors.length > 0 ? (
          <div className="flex flex-col gap-3">
            {guarantors.map((g) => (
              <GuarantorRow key={g.id} request={g} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-sand-400">No guarantors on record.</p>
        )}
      </Card>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">
          Repayment history
        </p>
        <DataTable
          columns={repaymentColumns}
          rows={loan?.repayments ?? []}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          defaultSort={{ key: "date", dir: "desc" }}
          pageSize={12}
          emptyState={{
            title: "No repayments yet",
            description: "Repayments will appear here once posted.",
          }}
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">
          Your repayment requests
        </p>
        <DataTable
          columns={requestColumns}
          rows={repaymentRequests ?? []}
          rowKey={(r) => r.id}
          isLoading={repaymentRequestsLoading}
          emptyState={{
            title: "No repayment requests yet",
            description: "Manual repayments you submit will appear here while awaiting admin review.",
          }}
        />
      </div>

      <RepaymentRequestModal
        open={repayOpen}
        onClose={() => setRepayOpen(false)}
        title="Make a loan repayment"
        purpose="LOAN_REPAYMENTS"
        maxAmount={Number(loan?.outstanding_balance ?? 0)}
        isSubmitting={repayMutation.isPending}
        onSubmit={(input) => repayMutation.mutate(input)}
      />

    </div>
  );
}

function GuarantorRow({ request }: { request: MockGuarantorRequest }) {
  const member = findMember(request.guarantor_member_id);
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Avatar firstName={member?.first_name} lastName={member?.last_name} size="sm" />
        <span className="text-sm text-sand-800 dark:text-sand-100">
          {member ? `${member.first_name} ${member.last_name}` : "Unknown member"}
        </span>
      </div>
      <StatusBadge status={request.status} />
    </div>
  );
}
