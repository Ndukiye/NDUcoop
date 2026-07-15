import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { Icon } from "../../components/Icon";
import { CopyButton } from "../../components/CopyButton";
import { StatusBadge } from "../../components/StatusBadge";
import { ProgressBar } from "../../components/ProgressBar";
import { formatNaira } from "../../lib/format";
import { useBalanceVisibility, MASKED_VALUE } from "../../lib/useBalanceVisibility";
import { fetchMyProfile } from "./api";
import { fetchMyLoans, OPEN_LOAN_STATUSES } from "../loans/api";
import { fetchCommodityApplications, CURRENT_MEMBER_ID } from "../commodities/api";

export function MemberDashboardPage() {
  const navigate = useNavigate();
  const [hidden, setHidden] = useBalanceVisibility();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["members", "me"],
    queryFn: fetchMyProfile,
  });
  const { data: loans } = useQuery({ queryKey: ["loans", "mine"], queryFn: fetchMyLoans });
  const { data: commodityApps } = useQuery({
    queryKey: ["commodities", "mine"],
    queryFn: () => fetchCommodityApplications({ memberId: CURRENT_MEMBER_ID }),
  });

  const mask = (value: string | number) => (hidden ? MASKED_VALUE : formatNaira(value));

  const activeLoan = loans?.find((l) => OPEN_LOAN_STATUSES.includes(l.status));
  const activeCommodities = (commodityApps?.results ?? []).filter(
    (a) => a.status === "APPROVED" && Number(a.outstanding_balance) > 0,
  );
  const hasActivity = !!activeLoan || activeCommodities.length > 0;

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
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-medium text-pine-50">
              {isLoading ? "Welcome back" : `Welcome back, ${profile?.first_name}`}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-pine-200">
              {profile ? (
                <>
                  Membership ID {profile.membership_id}
                  <CopyButton value={profile.membership_id} tone="on-dark" />
                </>
              ) : (
                "Loading your account…"
              )}
            </p>
          </div>
          <button
            onClick={() => setHidden((h) => !h)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-pine-100 backdrop-blur-sm transition-colors hover:bg-white/15"
            aria-label={hidden ? "Show balances" : "Hide balances"}
          >
            <Icon name={hidden ? "eye-off" : "eye"} className="h-4 w-4" />
            <span className="hidden sm:inline">{hidden ? "Show balances" : "Hide balances"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard
          label="Total assets"
          value={mask(profile?.total_asset ?? 0)}
          tone="accent"
          hint="Shares + Compulsory Savings + Deposits"
          className="col-span-2 lg:col-span-1"
        />
        <StatCard label="Shares" value={mask(profile?.shares_balance ?? 0)} />
        <StatCard
          label="Compulsory savings"
          value={mask(profile?.compulsory_savings_balance ?? 0)}
        />
        <StatCard label="Deposits" value={mask(profile?.deposit_balance ?? 0)} />
        <StatCard label="Welfare" value={mask(profile?.welfare_balance ?? 0)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <p className="mb-4 text-sm font-medium text-sand-500 dark:text-sand-400">
            Quick actions
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" className="justify-start" onClick={() => navigate("/deposits")}>
              <Icon name="arrow-down" className="h-4 w-4" /> Make a deposit
            </Button>
            <Button
              variant="secondary"
              className="justify-start"
              onClick={() => navigate("/withdrawals")}
            >
              <Icon name="arrow-up" className="h-4 w-4" /> Apply for a withdrawal
            </Button>
            <Button
              variant="secondary"
              className="justify-start"
              onClick={() => navigate(activeLoan ? `/loans/${activeLoan.id}` : "/loans/apply")}
            >
              <Icon name="handshake" className="h-4 w-4" />
              {activeLoan ? "View my loan" : "Apply for a loan"}
            </Button>
            <Button
              variant="secondary"
              className="justify-start"
              onClick={() => navigate("/commodities")}
            >
              <Icon name="sack" className="h-4 w-4" /> Apply for a commodity
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          {hasActivity ? (
            <Card className="flex flex-col gap-4 p-5">
              <p className="text-sm font-medium text-sand-500 dark:text-sand-400">
                Active loans &amp; commodities
              </p>
              {activeLoan && (
                <button
                  onClick={() => navigate(`/loans/${activeLoan.id}`)}
                  className="flex flex-col gap-2 rounded-lg border border-sand-200 p-4 text-left transition-colors hover:bg-sand-50 dark:border-sand-700 dark:hover:bg-sand-800/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sand-900 dark:text-sand-50">
                      {activeLoan.product_name} loan
                    </span>
                    <StatusBadge status={activeLoan.status} />
                  </div>
                  <div className="flex justify-between text-sm text-sand-500 dark:text-sand-400">
                    <span>Outstanding</span>
                    <span className="font-medium text-sand-800 dark:text-sand-100">
                      {mask(activeLoan.outstanding_balance)}
                    </span>
                  </div>
                  <ProgressBar
                    value={
                      Number(activeLoan.principal_granted) - Number(activeLoan.outstanding_balance)
                    }
                    max={Number(activeLoan.principal_granted)}
                  />
                </button>
              )}
              {activeCommodities.map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate("/commodities")}
                  className="flex flex-col gap-2 rounded-lg border border-sand-200 p-4 text-left transition-colors hover:bg-sand-50 dark:border-sand-700 dark:hover:bg-sand-800/60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sand-900 dark:text-sand-50">
                      {a.commodity_name}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="flex justify-between text-sm text-sand-500 dark:text-sand-400">
                    <span>Outstanding</span>
                    <span className="font-medium text-sand-800 dark:text-sand-100">
                      {mask(a.outstanding_balance)}
                    </span>
                  </div>
                  <ProgressBar
                    value={Number(a.total_amount) - Number(a.outstanding_balance)}
                    max={Number(a.total_amount)}
                  />
                </button>
              ))}
            </Card>
          ) : (
            <EmptyState
              title="No active loans or commodities"
              description="Loans and commodity plans you have running will show up here."
            />
          )}
        </div>
      </div>
    </div>
  );
}
