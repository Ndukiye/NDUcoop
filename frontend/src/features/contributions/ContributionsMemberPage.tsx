import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "../../components/StatCard";
import { DataTable, type Column } from "../../components/Table";
import { TextField } from "../../components/TextField";
import { formatNaira } from "../../lib/format";
import { fetchMyContributions, type ContributionMonthRow } from "./api";
import { GenerateReceiptButton } from "../shared/GenerateReceiptButton";

const CURRENT_MEMBER_ID = 1;

export function ContributionsMemberPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["contributions", "mine"],
    queryFn: () => fetchMyContributions(CURRENT_MEMBER_ID),
  });

  const rows = useMemo(() => {
    const results = data ?? [];
    if (!search.trim()) return results;
    const q = search.toLowerCase();
    return results.filter((r) => r.month.toLowerCase().includes(q));
  }, [data, search]);

  const columns: Column<ContributionMonthRow>[] = [
    {
      key: "month",
      header: "Month",
      render: (r) => r.month,
      className: "whitespace-nowrap md:min-w-[9.5rem]",
      sortAccessor: (r) => Date.parse(r.month),
    },
    {
      key: "shares",
      header: "Shares",
      render: (r) => formatNaira(r.shares),
      className: "hidden md:table-cell text-right",
      sortAccessor: (r) => Number(r.shares),
    },
    {
      key: "compulsory",
      header: "Compulsory savings",
      render: (r) => formatNaira(r.compulsory),
      className: "hidden md:table-cell text-right",
      sortAccessor: (r) => Number(r.compulsory),
    },
    {
      key: "welfare",
      header: "Welfare",
      render: (r) => formatNaira(r.welfare),
      className: "hidden md:table-cell text-right",
      sortAccessor: (r) => Number(r.welfare),
    },
    {
      key: "deposit",
      header: "Deposit",
      render: (r) => formatNaira(r.deposit),
      className: "hidden md:table-cell text-right",
      sortAccessor: (r) => Number(r.deposit),
    },
    {
      key: "total",
      header: "Total",
      render: (r) => formatNaira(r.total),
      className: "text-right font-medium",
      sortAccessor: (r) => Number(r.total),
    },
    { key: "receipt", header: "Receipt", render: () => <GenerateReceiptButton /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-sand-500 dark:text-sand-400">
          Your monthly Shares, Welfare, Compulsory Savings and Deposit history.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Minimum monthly total"
          value={formatNaira(10200)}
          tone="accent"
          hint="Remainder goes to Deposits"
          className="col-span-2 lg:col-span-1"
        />
        <StatCard label="Monthly shares" value={formatNaira(7000)} hint="Fixed contribution" />
        <StatCard label="Monthly welfare" value={formatNaira(200)} hint="Fixed contribution" />
        <StatCard
          label="Monthly compulsory savings"
          value={formatNaira(3000)}
          hint="Fixed contribution"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.month}
        isLoading={isLoading}
        defaultSort={{ key: "month", dir: "desc" }}
        pageSize={12}
        toolbar={
          <TextField
            label="Search"
            hideLabel
            placeholder="Search month, e.g. January 2026"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
          />
        }
        emptyState={{
          title: "No contributions yet",
          description: "Your monthly contribution history will appear here once posted.",
        }}
      />
    </div>
  );
}
