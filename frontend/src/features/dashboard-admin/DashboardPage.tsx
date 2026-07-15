import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { Icon } from "../../components/Icon";
import { useAuthStore } from "../../store/auth";
import { isFullAdmin } from "../../lib/roles";
import { formatNaira, formatDateTime } from "../../lib/format";
import {
  fetchMemberCount,
  fetchDashboardOverview,
  fetchRecentActivity,
  type DashboardOverview,
  type RecentActivityItem,
} from "./api";

const activityMeta: Record<RecentActivityItem["type"], { icon: "arrow-down" | "arrow-up" | "handshake" | "sack"; label: string }> = {
  DEPOSIT: { icon: "arrow-down", label: "Deposit" },
  WITHDRAWAL: { icon: "arrow-up", label: "Withdrawal" },
  LOAN: { icon: "handshake", label: "Loan" },
  COMMODITY: { icon: "sack", label: "Commodity" },
};

const pendingQueues = [
  {
    label: "Pending deposits",
    icon: "arrow-down" as const,
    to: "/deposits",
    key: "pendingDeposits" as const,
  },
  {
    label: "Pending withdrawals",
    icon: "arrow-up" as const,
    to: "/withdrawals",
    key: "pendingWithdrawals" as const,
  },
  {
    label: "Pending loans",
    icon: "handshake" as const,
    to: "/loans",
    key: "pendingLoans" as const,
  },
  {
    label: "Pending commodities",
    icon: "sack" as const,
    to: "/commodities",
    key: "pendingCommodities" as const,
  },
];

export function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data: memberCount } = useQuery({
    queryKey: ["members", "count"],
    queryFn: fetchMemberCount,
  });
  const { data: overview } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboardOverview,
  });
  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: fetchRecentActivity,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pine-900 via-pine-800 to-pine-950 px-6 py-7 shadow-lifted sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 15%, var(--color-gold-300) 0, transparent 38%), radial-gradient(circle at 90% 85%, var(--color-pine-300) 0, transparent 42%)",
          }}
        />
        <div className="relative flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-medium text-pine-50">Cooperative overview</h2>
          {!isFullAdmin(user?.role) && (
            <span className="inline-flex items-center rounded-full border border-pine-200/30 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-pine-100">
              Read-only access
            </span>
          )}
        </div>
      </div>

      {overview && (
        <Card
          onClick={() => navigate("/contributions")}
          className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-sand-50 dark:hover:bg-sand-800/60 ${
            overview.currentMonthContributionsPosted
              ? "border-pine-200 dark:border-pine-800"
              : "border-gold-200 dark:border-gold-800/50"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              overview.currentMonthContributionsPosted
                ? "bg-pine-100 text-pine-700 dark:bg-pine-900/40 dark:text-pine-300"
                : "bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-300"
            }`}
          >
            <Icon name={overview.currentMonthContributionsPosted ? "check" : "alert-triangle"} className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-sm font-medium text-sand-900 dark:text-sand-50">
              {overview.currentMonthContributionsPosted
                ? "This month's contributions have been posted"
                : "This month's contributions haven't been posted yet"}
            </p>
            <p className="text-xs text-sand-500 dark:text-sand-400">
              Last posted: {overview.lastContributionMonth ?? "never"}
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total members" value={memberCount?.toLocaleString() ?? "—"} tone="accent" />
        <StatCard label="Total assets" value={overview ? formatNaira(overview.totalAssets) : "—"} />
        <StatCard label="Active loans" value={overview ? String(overview.activeLoans) : "—"} />
        <StatCard
          label="Active commodity plans"
          value={overview ? String(overview.activeCommodityPlans) : "—"}
        />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">
          Balances breakdown
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <StatCard label="Total shares" value={overview ? formatNaira(overview.totalShares) : "—"} />
          <StatCard label="Total welfare" value={overview ? formatNaira(overview.totalWelfare) : "—"} />
          <StatCard
            label="Total compulsory savings"
            value={overview ? formatNaira(overview.totalCompulsorySavings) : "—"}
          />
          <StatCard label="Total deposits" value={overview ? formatNaira(overview.totalDeposits) : "—"} />
          <StatCard
            label="Completed loans"
            value={overview ? String(overview.completedLoans) : "—"}
            className="col-span-2 lg:col-span-1"
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">
          Pending approvals
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {pendingQueues.map((q) => (
            <Card
              key={q.label}
              onClick={() => navigate(q.to)}
              className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-sand-50 dark:hover:bg-sand-800/60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine-100 text-pine-700 dark:bg-pine-900/40 dark:text-pine-300">
                <Icon name={q.icon} className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm text-sand-500 dark:text-sand-400">{q.label}</p>
                <p className="font-display text-lg font-medium text-sand-900 dark:text-sand-50">
                  {overview ? (overview as DashboardOverview)[q.key] : 0}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-sand-500 dark:text-sand-400">
          Recent approvals
        </p>
        {activityLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-sand-100 dark:bg-sand-800" />
        ) : activity && activity.length > 0 ? (
          <Card className="divide-y divide-sand-100 overflow-hidden dark:divide-sand-800">
            {activity.map((item) => {
              const meta = activityMeta[item.type];
              return (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine-100 text-pine-700 dark:bg-pine-900/40 dark:text-pine-300">
                    <Icon name={meta.icon} className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-sand-900 dark:text-sand-50">
                      {meta.label} &middot; {item.memberName}
                    </p>
                    <p className="text-xs text-sand-500 dark:text-sand-400">
                      {formatDateTime(item.decidedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-medium text-sand-800 dark:text-sand-100">
                      {formatNaira(item.amount)}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              );
            })}
          </Card>
        ) : (
          <EmptyState
            title="No recent approvals yet"
            description="Once deposits, withdrawals, loans, or commodities are approved or rejected, they'll be listed here with a link to the audit trail."
          />
        )}
      </div>
    </div>
  );
}
