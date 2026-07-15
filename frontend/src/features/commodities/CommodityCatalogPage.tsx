import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Icon } from "../../components/Icon";
import { ProgressBar } from "../../components/ProgressBar";
import { DataTable, type Column } from "../../components/Table";
import { StatusBadge } from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";
import { formatNaira, formatDate } from "../../lib/format";
import {
  fetchCommodityTypes,
  fetchCommodityApplications,
  submitCommodityRepaymentRequest,
  type CommodityApplication,
  CURRENT_MEMBER_ID,
} from "./api";
import { ApplyCommodityModal } from "./ApplyCommodityModal";
import { RepaymentRequestModal } from "../shared/RepaymentRequestModal";
import { GenerateReceiptButton } from "../shared/GenerateReceiptButton";
import type { MockCommodityType } from "../../mocks/commodities";

export function CommodityCatalogPage() {
  const [applying, setApplying] = useState<MockCommodityType | null>(null);
  const [repaying, setRepaying] = useState<CommodityApplication | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: types, isLoading: typesLoading } = useQuery({
    queryKey: ["commodities", "types"],
    queryFn: fetchCommodityTypes,
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["commodities", "mine"],
    queryFn: () => fetchCommodityApplications({ memberId: CURRENT_MEMBER_ID }),
  });

  const repayMutation = useMutation({
    mutationFn: (input: { amount: string; note: string; receiptFilename: string }) =>
      submitCommodityRepaymentRequest({ applicationId: repaying!.id, ...input }),
    onSuccess: () => {
      toast.show({
        tone: "success",
        title: "Repayment submitted",
        description: "An admin will review your receipt shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
      setRepaying(null);
    },
  });

  const columns: Column<CommodityApplication>[] = [
    { key: "item", header: "Item", render: (a) => a.commodity_name, sortAccessor: (a) => a.commodity_name },
    {
      key: "qty",
      header: "Quantity",
      render: (a) => a.quantity,
      className: "hidden md:table-cell text-right",
      sortAccessor: (a) => a.quantity,
    },
    {
      key: "total",
      header: "Total",
      render: (a) => formatNaira(a.total_amount),
      className: "text-right",
      sortAccessor: (a) => Number(a.total_amount),
    },
    {
      key: "progress",
      header: "Repayment progress",
      className: "hidden md:table-cell",
      render: (a) =>
        a.status === "APPROVED" || a.status === "COMPLETED" ? (
          <div className="w-32">
            <ProgressBar
              value={Number(a.total_amount) - Number(a.outstanding_balance)}
              max={Number(a.total_amount)}
            />
          </div>
        ) : (
          "—"
        ),
    },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    {
      key: "date",
      header: "Submitted",
      render: (a) => formatDate(a.submitted_at),
      className: "hidden whitespace-nowrap md:table-cell md:min-w-[9.5rem]",
      sortAccessor: (a) => Date.parse(a.submitted_at),
    },
    {
      key: "receipt",
      header: "Receipt",
      className: "hidden md:table-cell",
      render: (a) =>
        a.status === "APPROVED" || a.status === "COMPLETED" ? <GenerateReceiptButton /> : "—",
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (a) =>
        a.status === "APPROVED" && Number(a.outstanding_balance) > 0 ? (
          <Button size="sm" variant="secondary" onClick={() => setRepaying(a)}>
            Repay
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-sand-500 dark:text-sand-400">
          Apply for cooperative-stocked items on a repayment plan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {typesLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-44 animate-pulse" />
            ))
          : types?.map((type) => (
              <Card key={type.id} className="flex flex-col gap-3.5 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-300">
                      <Icon name="sack" className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-medium text-sand-900 dark:text-sand-50 sm:text-lg">
                        {type.name}
                      </h3>
                      <p className="text-xs text-sand-500 dark:text-sand-400 sm:text-sm">
                        {formatNaira(type.selling_price)} / {type.unit}
                      </p>
                    </div>
                  </div>
                  <Badge
                    tone={type.current_stock_quantity > 0 ? "pine" : "brick"}
                    className="shrink-0 whitespace-nowrap"
                  >
                    {type.current_stock_quantity > 0 ? "In stock" : "Out of stock"}
                  </Badge>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-sand-400">
                    <span>Stock</span>
                    <span>{type.current_stock_quantity} left</span>
                  </div>
                  <ProgressBar
                    value={type.current_stock_quantity}
                    max={150}
                    tone={type.current_stock_quantity > 20 ? "pine" : "gold"}
                  />
                </div>
                <Button
                  className="mt-auto"
                  disabled={type.current_stock_quantity === 0}
                  onClick={() => setApplying(type)}
                >
                  Apply
                </Button>
              </Card>
            ))}
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">
          My applications
        </p>
        <DataTable
          columns={columns}
          rows={applications?.results ?? []}
          rowKey={(a) => a.id}
          isLoading={appsLoading}
          defaultSort={{ key: "date", dir: "desc" }}
          pageSize={10}
          emptyState={{
            title: "No applications yet",
            description: "Applications you submit will show up here.",
          }}
        />
      </div>

      <ApplyCommodityModal type={applying} onClose={() => setApplying(null)} />

      <RepaymentRequestModal
        open={!!repaying}
        onClose={() => setRepaying(null)}
        title={repaying ? `Repay ${repaying.commodity_name}` : "Repay"}
        purpose="COMMODITY_REPAYMENTS"
        maxAmount={repaying ? Number(repaying.outstanding_balance) : undefined}
        isSubmitting={repayMutation.isPending}
        onSubmit={(input) => repayMutation.mutate(input)}
      />
    </div>
  );
}
