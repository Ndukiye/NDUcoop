import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import { DataTable, type Column } from "../../components/Table";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { formatDateTime } from "../../lib/format";
import { fetchMyReportJobs, generateReport } from "./api";
import type { MockReportJob } from "../../mocks/reports";

const periods = ["July 2026", "June 2026", "May 2026", "April 2026", "Year to date"];

export function ReportsMemberPage() {
  const [period, setPeriod] = useState(periods[0]);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["reports", "mine"],
    queryFn: fetchMyReportJobs,
  });

  const mutation = useMutation({
    mutationFn: () =>
      generateReport({
        reportType: "MEMBER_STATEMENT",
        format: "PDF",
        periodLabel: period,
        scope: "MEMBER",
        generatedBy: "Ifeoma Chukwu",
        memberId: 1,
      }),
    onSuccess: () => {
      toast.show({
        tone: "success",
        title: "Statement ready",
        description: `Your statement for ${period} has been generated.`,
      });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const columns: Column<MockReportJob>[] = [
    { key: "period", header: "Period", render: (j) => j.period_label },
    { key: "date", header: "Generated", render: (j) => formatDateTime(j.generated_at) },
    {
      key: "download",
      header: "",
      className: "text-right",
      render: () => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            toast.show({
              tone: "info",
              title: "Download started",
              description: "This is a mock — no real file is generated yet.",
            })
          }
        >
          <Icon name="download" className="h-4 w-4" /> Download
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-sand-500 dark:text-sand-400">
          Download your personal cooperative statement.
        </p>
      </div>

      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-xs">
          <Select
            label="Period"
            options={periods.map((p) => ({ value: p, label: p }))}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
        <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
          <Icon name="download" className="h-4 w-4" /> Download my statement
        </Button>
      </Card>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">
          Previous downloads
        </p>
        <DataTable
          columns={columns}
          rows={jobs ?? []}
          rowKey={(j) => j.id}
          isLoading={isLoading}
          emptyState={{
            title: "No statements yet",
            description: "Statements you generate will appear here.",
          }}
        />
      </div>
    </div>
  );
}
