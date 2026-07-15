import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { StatusBadge } from "../../components/StatusBadge";
import { Icon } from "../../components/Icon";
import { DataTable, type Column } from "../../components/Table";
import { formatNaira } from "../../lib/format";
import { fetchLoanProducts, fetchMyLoans, OPEN_LOAN_STATUSES, type LoanWithMember } from "./api";
import { fetchMyGuarantorRequests } from "../guarantors/api";
import { GuarantorInboxPage } from "../guarantors/GuarantorInboxPage";

export function LoanProductsPage() {
  const [tab, setTab] = useState<"mine" | "guarantor">("mine");
  const navigate = useNavigate();

  const { data: products } = useQuery({
    queryKey: ["loans", "products"],
    queryFn: fetchLoanProducts,
  });
  const { data: myLoans, isLoading: loansLoading } = useQuery({
    queryKey: ["loans", "mine"],
    queryFn: fetchMyLoans,
  });
  const { data: guarantorRequests } = useQuery({
    queryKey: ["guarantors", "mine"],
    queryFn: fetchMyGuarantorRequests,
  });

  const pendingCount = guarantorRequests?.length ?? 0;
  const openLoan = myLoans?.find((l) => OPEN_LOAN_STATUSES.includes(l.status));

  const columns: Column<LoanWithMember>[] = [
    { key: "product", header: "Product", render: (l) => l.product_name },
    {
      key: "principal",
      header: "Principal",
      render: (l) => formatNaira(l.principal_granted),
      className: "hidden md:table-cell text-right",
    },
    {
      key: "outstanding",
      header: "Outstanding",
      render: (l) => formatNaira(l.outstanding_balance),
      className: "text-right",
    },
    { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-sand-500 dark:text-sand-400">
          Loan products, applications, and guarantor requests.
        </p>
      </div>

      {openLoan && (
        <div className="flex items-start gap-2.5 rounded-lg border border-gold-200 bg-gold-50 px-3.5 py-3 text-sm text-gold-800 dark:border-gold-800/50 dark:bg-gold-900/20 dark:text-gold-200">
          <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            You already have a loan in progress ({openLoan.product_name},{" "}
            <StatusBadge status={openLoan.status} />). A member can only have one active loan at a
            time — if you need more funds,{" "}
            <button
              onClick={() => navigate(`/loans/${openLoan.id}`)}
              className="font-semibold underline underline-offset-2"
            >
              top up your existing loan
            </button>{" "}
            instead of applying for a new one.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        {products?.map((p) => (
          <Card key={p.id} className="flex flex-col gap-2.5 p-4 sm:gap-3 sm:p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-medium text-sand-900 dark:text-sand-50 sm:text-lg">
                {p.name}
              </h3>
              <Badge tone="gold">{p.interest_rate}%</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-sand-500 dark:text-sand-400">
                {p.duration_months}-month repayment
              </p>
              <div className="md:hidden">
                <Button
                  size="sm"
                  disabled={!!openLoan}
                  onClick={() => navigate("/loans/apply", { state: { productId: p.id } })}
                >
                  Apply
                </Button>
              </div>
            </div>
            <div className="mt-auto hidden md:block">
              <Button
                className="w-full"
                disabled={!!openLoan}
                onClick={() => navigate("/loans/apply", { state: { productId: p.id } })}
              >
                Apply
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex w-fit gap-1 rounded-lg bg-sand-100 p-1 dark:bg-sand-800">
        <button
          onClick={() => setTab("mine")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "mine"
              ? "bg-white text-sand-900 shadow-soft dark:bg-sand-900 dark:text-sand-50"
              : "text-sand-500 dark:text-sand-400"
          }`}
        >
          My loans
        </button>
        <button
          onClick={() => setTab("guarantor")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "guarantor"
              ? "bg-white text-sand-900 shadow-soft dark:bg-sand-900 dark:text-sand-50"
              : "text-sand-500 dark:text-sand-400"
          }`}
        >
          Guarantor requests{pendingCount > 0 ? ` (${pendingCount})` : ""}
        </button>
      </div>

      {tab === "mine" ? (
        <DataTable
          columns={columns}
          rows={myLoans ?? []}
          rowKey={(l) => l.id}
          isLoading={loansLoading}
          pageSize={10}
          onRowClick={(l) => navigate(`/loans/${l.id}`)}
          emptyState={{
            title: "No loans yet",
            description: "Apply for a loan product above to get started.",
          }}
        />
      ) : (
        <GuarantorInboxPage />
      )}
    </div>
  );
}
