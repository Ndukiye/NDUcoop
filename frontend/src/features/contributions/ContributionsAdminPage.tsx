import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { ProgressBar } from "../../components/ProgressBar";
import { DataTable, type Column } from "../../components/Table";
import { StatCard } from "../../components/StatCard";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { formatNaira, formatDateTime } from "../../lib/format";
import { fetchContributionBatches, postContributions } from "./api";
import { CorrectContributionModal } from "./CorrectContributionModal";
import type { MockContributionBatch } from "../../mocks/contributions";

export function ContributionsAdminPage() {
  const [open, setOpen] = useState(false);
  const [jobState, setJobState] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [correcting, setCorrecting] = useState<MockContributionBatch | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useQuery({
    queryKey: ["contributions", "batches"],
    queryFn: fetchContributionBatches,
  });

  const mutation = useMutation({
    mutationFn: postContributions,
    onSuccess: (batch) => {
      toast.show({
        tone: "success",
        title: "Contributions posted",
        description: `${batch.member_count} members · ${formatNaira(batch.total_amount)} for ${batch.month}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
    },
  });

  function startPosting() {
    setJobState("running");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 20, 92));
    }, 220);
    mutation.mutate(undefined, {
      onSettled: () => {
        clearInterval(interval);
        setProgress(100);
        setJobState("done");
      },
    });
  }

  function closeModal() {
    setOpen(false);
    setJobState("idle");
    setProgress(0);
  }

  const columns: Column<MockContributionBatch>[] = [
    {
      key: "month",
      header: "Month",
      render: (b) => b.month,
      className: "whitespace-nowrap md:min-w-[9.5rem]",
      sortAccessor: (b) => Date.parse(b.month),
    },
    {
      key: "posted",
      header: "Posted",
      render: (b) => formatDateTime(b.posted_at),
      className: "hidden md:table-cell",
      sortAccessor: (b) => Date.parse(b.posted_at),
    },
    { key: "by", header: "Posted by", render: (b) => b.posted_by, className: "hidden md:table-cell" },
    {
      key: "members",
      header: "Members",
      render: (b) => b.member_count,
      className: "hidden md:table-cell text-right",
      sortAccessor: (b) => b.member_count,
    },
    {
      key: "total",
      header: "Total posted",
      render: (b) => formatNaira(b.total_amount),
      className: "text-right",
      sortAccessor: (b) => Number(b.total_amount),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <Button size="sm" variant="ghost" onClick={() => setCorrecting(b)}>
          <Icon name="edit" className="h-4 w-4" /> Correct
        </Button>
      ),
    },
  ];

  const latest = batches?.[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-sand-500 dark:text-sand-400">
            Post this month's Shares, Welfare, Compulsory Savings and Deposit contributions.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Icon name="wallet" className="h-4 w-4" /> Post this month's contributions
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          label="Last posted"
          value={latest?.month ?? "—"}
          tone="accent"
          className="col-span-2 sm:col-span-1"
        />
        <StatCard label="Members covered" value={latest ? String(latest.member_count) : "—"} />
        <StatCard label="Total posted" value={latest ? formatNaira(latest.total_amount) : "—"} />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">
          Posting history
        </p>
        <DataTable
          columns={columns}
          rows={batches ?? []}
          rowKey={(b) => b.id}
          isLoading={isLoading}
          pageSize={12}
          emptyState={{
            title: "No contributions posted yet",
            description: "Post this month's contributions to get started.",
          }}
        />
      </div>

      <Modal
        open={open}
        onClose={jobState === "running" ? () => {} : closeModal}
        title="Post monthly contributions"
        footer={
          jobState === "idle" ? (
            <>
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={startPosting}>Start posting</Button>
            </>
          ) : jobState === "done" ? (
            <Button onClick={closeModal}>Done</Button>
          ) : null
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-sand-600 dark:text-sand-300">
            This posts Shares (₦7,000), Welfare (₦200), and Compulsory Savings (₦3,000) for every
            active member, plus any remainder above ₦10,200 to Deposits.
          </p>
          {jobState !== "idle" && (
            <div className="flex flex-col gap-2">
              <ProgressBar value={progress} max={100} tone={jobState === "done" ? "pine" : "gold"} />
              <p className="text-xs text-sand-500 dark:text-sand-400">
                {jobState === "done" ? "Posting complete." : "Posting contributions…"}
              </p>
            </div>
          )}
        </div>
      </Modal>

      <CorrectContributionModal batch={correcting} onClose={() => setCorrecting(null)} />
    </div>
  );
}
