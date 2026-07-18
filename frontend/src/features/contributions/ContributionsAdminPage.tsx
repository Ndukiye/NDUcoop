import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { ProgressBar } from "../../components/ProgressBar";
import { DataTable, type Column } from "../../components/Table";
import { StatCard } from "../../components/StatCard";
import { Icon } from "../../components/Icon";
import { TextField } from "../../components/TextField";
import { useToast } from "../../components/Toast";
import { formatNaira, formatDateTime } from "../../lib/format";
import {
  fetchContributionBatches,
  fetchPostingPreparation,
  postContributions,
  currentPostingMonth,
} from "./api";
import { CorrectContributionModal } from "./CorrectContributionModal";
import type { MockContributionBatch, MockPostingRow } from "../../mocks/contributions";

const MINIMUM_TOTAL = 10200;

export function ContributionsAdminPage() {
  const [open, setOpen] = useState(false);
  const [jobState, setJobState] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [correcting, setCorrecting] = useState<MockContributionBatch | null>(null);
  const [rows, setRows] = useState<MockPostingRow[]>([]);
  const [prepSearch, setPrepSearch] = useState("");
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useQuery({
    queryKey: ["contributions", "batches"],
    queryFn: fetchContributionBatches,
  });

  const { data: preparation, isLoading: prepLoading } = useQuery({
    queryKey: ["contributions", "preparation"],
    queryFn: fetchPostingPreparation,
    enabled: open,
  });

  useEffect(() => {
    if (preparation) setRows(preparation.map((r) => ({ ...r })));
  }, [preparation]);

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

  const includedRows = rows.filter((r) => r.included);
  const invalidRows = includedRows.filter((r) => Number(r.amount) < MINIMUM_TOTAL);
  const totalToPost = includedRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const visiblePrepRows = useMemo(() => {
    if (!prepSearch.trim()) return rows;
    const q = prepSearch.toLowerCase();
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.membership_id.toLowerCase().includes(q),
    );
  }, [rows, prepSearch]);

  function updateRow(memberId: number, updates: Partial<MockPostingRow>) {
    setRows((prev) => prev.map((r) => (r.member_id === memberId ? { ...r, ...updates } : r)));
  }

  function startPosting() {
    setJobState("running");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 20, 92));
    }, 220);
    mutation.mutate(
      includedRows.map((r) => ({ memberId: r.member_id, amount: Number(r.amount).toFixed(2) })),
      {
        onSettled: () => {
          clearInterval(interval);
          setProgress(100);
          setJobState("done");
        },
      },
    );
  }

  function closeModal() {
    setOpen(false);
    setJobState("idle");
    setProgress(0);
    setPrepSearch("");
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
            Review every member's amount, then post the month's contributions.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Icon name="wallet" className="h-4 w-4" /> Post contributions for {currentPostingMonth()}
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
        title={`Post contributions for ${currentPostingMonth()}`}
        size="lg"
        footer={
          jobState === "idle" ? (
            <>
              <div className="mr-auto text-sm text-sand-600 dark:text-sand-300">
                <span className="font-semibold">{includedRows.length}</span> of {rows.length}{" "}
                members · <span className="font-semibold">{formatNaira(totalToPost)}</span>
              </div>
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={startPosting}
                disabled={includedRows.length === 0 || invalidRows.length > 0}
              >
                Post contributions
              </Button>
            </>
          ) : jobState === "done" ? (
            <Button onClick={closeModal}>Done</Button>
          ) : null
        }
      >
        {jobState === "idle" ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-sand-600 dark:text-sand-300">
              Each member's amount is copied forward from the last posting (Shares ₦7,000 +
              Welfare ₦200 + Compulsory Savings ₦3,000 = ₦10,200 minimum; the remainder goes
              to Deposits). Adjust anyone whose contribution changed, or untick anyone who
              didn't pay this month. Individual entries can still be corrected after posting.
            </p>
            <TextField
              label="Search members"
              hideLabel
              placeholder="Search name or membership ID"
              value={prepSearch}
              onChange={(e) => setPrepSearch(e.target.value)}
            />
            {invalidRows.length > 0 && (
              <div className="flex items-start gap-2.5 rounded-lg border border-brick-100 bg-brick-50 px-3.5 py-2.5 text-sm text-brick-700 dark:border-brick-700/50 dark:bg-brick-500/10 dark:text-brick-300">
                <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {invalidRows.length} included member{invalidRows.length === 1 ? "" : "s"} below
                  the ₦10,200 minimum — raise the amount or untick them.
                </span>
              </div>
            )}
            <div className="max-h-80 overflow-y-auto rounded-xl border border-sand-200 dark:border-sand-700">
              {prepLoading ? (
                <div className="flex flex-col gap-2 p-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-sand-100 dark:bg-sand-800" />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-sand-100 dark:divide-sand-800">
                  {visiblePrepRows.map((row) => {
                    const extra = Number(row.amount) - MINIMUM_TOTAL;
                    const belowMin = row.included && Number(row.amount) < MINIMUM_TOTAL;
                    return (
                      <li
                        key={row.member_id}
                        className={clsx(
                          "flex items-center gap-3 px-3.5 py-2.5",
                          !row.included && "opacity-45",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={row.included}
                          onChange={(e) => updateRow(row.member_id, { included: e.target.checked })}
                          className="h-4 w-4 shrink-0 accent-pine-600"
                          aria-label={`Include ${row.name}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-sand-900 dark:text-sand-50">
                            {row.name}
                          </p>
                          <p className="text-xs text-sand-500 dark:text-sand-400">
                            {row.membership_id}
                            {row.included && extra > 0 && (
                              <span className="ml-1.5 text-pine-600 dark:text-pine-400">
                                +{formatNaira(extra)} to deposits
                              </span>
                            )}
                            {!row.included && <span className="ml-1.5">skipped this month</span>}
                          </p>
                        </div>
                        <div className="w-28 shrink-0 sm:w-32">
                          <TextField
                            label={`Amount for ${row.name}`}
                            hideLabel
                            type="number"
                            min={MINIMUM_TOTAL}
                            step="100"
                            value={row.amount}
                            disabled={!row.included}
                            onChange={(e) => updateRow(row.member_id, { amount: e.target.value })}
                            className={clsx(
                              "text-right",
                              belowMin && "border-brick-400 focus:border-brick-500 focus:ring-brick-400",
                            )}
                          />
                        </div>
                      </li>
                    );
                  })}
                  {visiblePrepRows.length === 0 && (
                    <li className="px-3.5 py-6 text-center text-sm text-sand-400">
                      No members match this search.
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <ProgressBar value={progress} max={100} tone={jobState === "done" ? "pine" : "gold"} />
            <p className="text-xs text-sand-500 dark:text-sand-400">
              {jobState === "done"
                ? `Posting complete — ${includedRows.length} members · ${formatNaira(totalToPost)}.`
                : "Posting contributions…"}
            </p>
          </div>
        )}
      </Modal>

      <CorrectContributionModal batch={correcting} onClose={() => setCorrecting(null)} />
    </div>
  );
}
