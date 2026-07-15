import { delay } from "../../mocks/delay";
import { members, findMember, totalAsset } from "../../mocks/members";
import { depositRequests } from "../../mocks/deposits";
import { withdrawalRequests } from "../../mocks/withdrawals";
import { loans } from "../../mocks/loans";
import { commodityApplications } from "../../mocks/commodities";
import { contributionBatches } from "../../mocks/contributions";

export interface AdminMemberListItem {
  id: number;
  membership_id: string;
  first_name: string;
  last_name: string;
  status: string;
  total_asset: string;
}

export async function fetchMemberCount(): Promise<number> {
  return delay(members.length, 150);
}

export interface DashboardOverview {
  totalShares: number;
  totalWelfare: number;
  totalCompulsorySavings: number;
  totalDeposits: number;
  totalAssets: number;
  activeLoans: number;
  completedLoans: number;
  activeCommodityPlans: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingLoans: number;
  pendingCommodities: number;
  currentMonthContributionsPosted: boolean;
  lastContributionMonth: string | null;
}

function currentMonthLabel() {
  return new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const overview: DashboardOverview = {
    totalShares: members.reduce((sum, m) => sum + Number(m.shares_balance), 0),
    totalWelfare: members.reduce((sum, m) => sum + Number(m.welfare_balance), 0),
    totalCompulsorySavings: members.reduce((sum, m) => sum + Number(m.compulsory_savings_balance), 0),
    totalDeposits: members.reduce((sum, m) => sum + Number(m.deposit_balance), 0),
    totalAssets: members.reduce((sum, m) => sum + Number(totalAsset(m)), 0),
    activeLoans: loans.filter((l) => l.status === "ACTIVE").length,
    completedLoans: loans.filter((l) => l.status === "COMPLETED").length,
    activeCommodityPlans: commodityApplications.filter((a) => a.status === "APPROVED").length,
    pendingDeposits: depositRequests.filter((r) => r.status === "PENDING").length,
    pendingWithdrawals: withdrawalRequests.filter((r) => r.status === "PENDING").length,
    pendingLoans: loans.filter((l) => l.status === "PENDING_ADMIN_APPROVAL").length,
    pendingCommodities: commodityApplications.filter((a) => a.status === "PENDING").length,
    currentMonthContributionsPosted: contributionBatches[0]?.month === currentMonthLabel(),
    lastContributionMonth: contributionBatches[0]?.month ?? null,
  };
  return delay(overview, 200);
}

export interface RecentActivityItem {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "LOAN" | "COMMODITY";
  memberName: string;
  amount: string;
  status: string;
  decidedAt: string;
}

export async function fetchRecentActivity(): Promise<RecentActivityItem[]> {
  const items: RecentActivityItem[] = [];

  for (const r of depositRequests) {
    if (!r.decided_at) continue;
    const m = findMember(r.member_id);
    items.push({
      id: `deposit-${r.id}`,
      type: "DEPOSIT",
      memberName: m ? `${m.first_name} ${m.last_name}` : "Unknown member",
      amount: r.amount,
      status: r.status,
      decidedAt: r.decided_at,
    });
  }

  for (const r of withdrawalRequests) {
    if (!r.decided_at) continue;
    const m = findMember(r.member_id);
    items.push({
      id: `withdrawal-${r.id}`,
      type: "WITHDRAWAL",
      memberName: m ? `${m.first_name} ${m.last_name}` : "Unknown member",
      amount: r.amount,
      status: r.status,
      decidedAt: r.decided_at,
    });
  }

  for (const l of loans) {
    if (!l.decided_at) continue;
    const m = findMember(l.member_id);
    items.push({
      id: `loan-${l.id}`,
      type: "LOAN",
      memberName: m ? `${m.first_name} ${m.last_name}` : "Unknown member",
      amount: l.principal_granted,
      status: l.status,
      decidedAt: l.decided_at,
    });
  }

  for (const a of commodityApplications) {
    if (!a.decided_at) continue;
    const m = findMember(a.member_id);
    items.push({
      id: `commodity-${a.id}`,
      type: "COMMODITY",
      memberName: m ? `${m.first_name} ${m.last_name}` : "Unknown member",
      amount: a.total_amount,
      status: a.status,
      decidedAt: a.decided_at,
    });
  }

  const sorted = items.sort(
    (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
  );
  return delay(sorted.slice(0, 6), 200);
}
