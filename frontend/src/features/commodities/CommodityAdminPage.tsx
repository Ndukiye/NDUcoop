import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/Button";
import { DataTable, type Column } from "../../components/Table";
import { Select } from "../../components/Select";
import { TextField } from "../../components/TextField";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { useAuthStore } from "../../store/auth";
import { isFullAdmin } from "../../lib/roles";
import { formatNaira, formatDate } from "../../lib/format";
import type { ApprovalStatus } from "../../lib/types";
import { ApprovalQueueTable } from "../shared/ApprovalQueueTable";
import { RepaymentRequestsQueue } from "../shared/RepaymentRequestsQueue";
import {
  fetchAllCommodityTypes,
  fetchCommodityApplications,
  decideCommodity,
  fetchCommodityRepaymentQueue,
  decideCommodityRepaymentRequest,
  type CommodityApplication,
} from "./api";
import { EditCommodityModal } from "./EditCommodityModal";
import { AddCommodityModal } from "./AddCommodityModal";
import type { MockCommodityType } from "../../mocks/commodities";

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "", label: "All statuses" },
];

export function CommodityAdminPage() {
  const [status, setStatus] = useState<ApprovalStatus | "">("PENDING");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [repaymentSearch, setRepaymentSearch] = useState("");
  const [editing, setEditing] = useState<MockCommodityType | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const role = useAuthStore((s) => s.user?.role);

  const { data: types, isLoading: typesLoading } = useQuery({
    queryKey: ["commodities", "types", "all"],
    queryFn: fetchAllCommodityTypes,
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["commodities", "admin", status],
    queryFn: () => fetchCommodityApplications({ status: status || undefined }),
  });

  const appRows = useMemo(() => {
    const results = applications?.results ?? [];
    if (!search.trim()) return results;
    const q = search.toLowerCase();
    return results.filter(
      (a) => a.member_name.toLowerCase().includes(q) || a.commodity_name.toLowerCase().includes(q),
    );
  }, [applications, search]);

  const decideMutation = useMutation({
    mutationFn: ({ id, decision, note }: { id: number; decision: "APPROVE" | "REJECT"; note: string }) =>
      decideCommodity(id, decision, note),
    onSuccess: (_, vars) => {
      toast.show({
        tone: vars.decision === "APPROVE" ? "success" : "info",
        title: vars.decision === "APPROVE" ? "Application approved" : "Application rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
    },
  });

  const { data: repaymentRequests, isLoading: repaymentRequestsLoading } = useQuery({
    queryKey: ["commodities", "repayment-queue"],
    queryFn: fetchCommodityRepaymentQueue,
  });

  const repaymentRows = useMemo(() => {
    const results = repaymentRequests ?? [];
    if (!repaymentSearch.trim()) return results;
    const q = repaymentSearch.toLowerCase();
    return results.filter((r) => r.member_name.toLowerCase().includes(q));
  }, [repaymentRequests, repaymentSearch]);

  const decideRepaymentMutation = useMutation({
    mutationFn: ({ id, decision, note }: { id: number; decision: "APPROVE" | "REJECT"; note: string }) =>
      decideCommodityRepaymentRequest(id, decision, note),
    onSuccess: (_, vars) => {
      toast.show({
        tone: vars.decision === "APPROVE" ? "success" : "info",
        title: vars.decision === "APPROVE" ? "Repayment approved" : "Repayment rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
    },
  });

  const typeColumns: Column<MockCommodityType>[] = [
    { key: "name", header: "Item", render: (t) => t.name },
    { key: "unit", header: "Unit", render: (t) => t.unit, className: "hidden md:table-cell" },
    {
      key: "cost",
      header: "Cost price",
      render: (t) => formatNaira(t.cost_price),
      className: "text-right",
    },
    {
      key: "selling",
      header: "Selling price",
      render: (t) => formatNaira(t.selling_price),
      className: "text-right",
    },
    {
      key: "stock",
      header: "Stock",
      render: (t) => t.current_stock_quantity,
      className: "text-right",
    },
    {
      key: "duration",
      header: "Max duration",
      render: (t) => `${t.default_max_duration_months} mo`,
      className: "text-right",
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (t) => (
        <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>
          <Icon name="edit" className="h-4 w-4" /> Edit
        </Button>
      ),
    },
  ];

  const appColumns: Column<CommodityApplication>[] = [
    { key: "member", header: "Member", render: (a) => a.member_name, sortAccessor: (a) => a.member_name },
    { key: "item", header: "Item", render: (a) => a.commodity_name },
    {
      key: "qty",
      header: "Qty",
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
      key: "date",
      header: "Submitted",
      render: (a) => formatDate(a.submitted_at),
      className: "hidden whitespace-nowrap md:table-cell md:min-w-[9.5rem]",
      sortAccessor: (a) => Date.parse(a.submitted_at),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-sand-500 dark:text-sand-400">
          Manage the catalog and review member applications.
        </p>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-sand-500 dark:text-sand-400">Catalog</p>
          {isFullAdmin(role) && (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Icon name="plus" className="h-4 w-4" /> Add commodity
            </Button>
          )}
        </div>
        <DataTable
          columns={typeColumns}
          rows={types ?? []}
          rowKey={(t) => t.id}
          isLoading={typesLoading}
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">Applications</p>
        <ApprovalQueueTable
          rows={appRows}
          isLoading={appsLoading}
          columns={appColumns}
          toolbar={
            <>
              <TextField
                label="Search"
                hideLabel
                placeholder="Search member or item"
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
                <p className="text-xs text-sand-400">Item</p>
                <p className="text-sand-800 dark:text-sand-100">
                  {row.commodity_name} × {row.quantity}
                </p>
              </div>
              <div>
                <p className="text-xs text-sand-400">Duration</p>
                <p className="text-sand-800 dark:text-sand-100">{row.duration_months} months</p>
              </div>
            </>
          )}
          emptyState={{
            title: "No applications",
            description: "There are no commodity applications matching this filter.",
          }}
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">
          Repayment requests
        </p>
        <RepaymentRequestsQueue
          rows={repaymentRows}
          isLoading={repaymentRequestsLoading}
          toolbar={
            <TextField
              label="Search"
              hideLabel
              placeholder="Search member name"
              value={repaymentSearch}
              onChange={(e) => setRepaymentSearch(e.target.value)}
              className="w-full sm:w-72"
            />
          }
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

      <EditCommodityModal type={editing} onClose={() => setEditing(null)} />
      <AddCommodityModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
