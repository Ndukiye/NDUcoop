import { delay } from "../../mocks/delay";
import { depositRequests } from "../../mocks/deposits";
import { withdrawalRequests } from "../../mocks/withdrawals";
import { loans } from "../../mocks/loans";
import { commodityApplications, commodityTypes } from "../../mocks/commodities";
import { repaymentRequests } from "../../mocks/repayments";
import { guarantorRequestsForMember } from "../../mocks/guarantors";
import { findMember } from "../../mocks/members";
import { isAnyAdmin, isMember, type Role } from "../../lib/roles";

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  tone: "success" | "error" | "info";
  link: string;
}

function memberNotifications(memberId: number): Notification[] {
  const items: Notification[] = [];

  for (const r of depositRequests) {
    if (r.member_id !== memberId || !r.decided_at) continue;
    items.push({
      id: `deposit-${r.id}`,
      title: r.status === "APPROVED" ? "Deposit approved" : "Deposit rejected",
      description: `₦${Number(r.amount).toLocaleString("en-NG")} deposit ${r.status === "APPROVED" ? "was approved" : "was rejected"}.`,
      date: r.decided_at,
      tone: r.status === "APPROVED" ? "success" : "error",
      link: "/deposits",
    });
  }

  for (const r of withdrawalRequests) {
    if (r.member_id !== memberId || !r.decided_at) continue;
    items.push({
      id: `withdrawal-${r.id}`,
      title: r.status === "APPROVED" ? "Withdrawal approved" : "Withdrawal rejected",
      description: `₦${Number(r.amount).toLocaleString("en-NG")} withdrawal ${r.status === "APPROVED" ? "was approved" : "was rejected"}.`,
      date: r.decided_at,
      tone: r.status === "APPROVED" ? "success" : "error",
      link: "/withdrawals",
    });
  }

  for (const l of loans) {
    if (l.member_id !== memberId || !l.decided_at) continue;
    if (l.status !== "ACTIVE" && l.status !== "REJECTED") continue;
    items.push({
      id: `loan-${l.id}`,
      title: l.status === "ACTIVE" ? "Loan approved" : "Loan application rejected",
      description:
        l.status === "ACTIVE"
          ? `Your loan of ₦${Number(l.principal_granted).toLocaleString("en-NG")} was approved and disbursed.`
          : "Your loan application was not approved.",
      date: l.decided_at,
      tone: l.status === "ACTIVE" ? "success" : "error",
      link: `/loans/${l.id}`,
    });
  }

  for (const a of commodityApplications) {
    if (a.member_id !== memberId || !a.decided_at) continue;
    const type = commodityTypes.find((t) => t.id === a.commodity_type_id);
    items.push({
      id: `commodity-${a.id}`,
      title: a.status === "REJECTED" ? "Commodity application rejected" : "Commodity application approved",
      description: `Your application for ${type?.name ?? "a commodity"} ${a.status === "REJECTED" ? "was rejected" : "was approved"}.`,
      date: a.decided_at,
      tone: a.status === "REJECTED" ? "error" : "success",
      link: "/commodities",
    });
  }

  for (const r of repaymentRequests) {
    if (r.member_id !== memberId || !r.decided_at) continue;
    items.push({
      id: `repayment-${r.id}`,
      title: r.status === "APPROVED" ? "Repayment approved" : "Repayment rejected",
      description: `Your ₦${Number(r.amount).toLocaleString("en-NG")} repayment ${r.status === "APPROVED" ? "was approved" : "was rejected"}.`,
      date: r.decided_at,
      tone: r.status === "APPROVED" ? "success" : "error",
      link: r.target_type === "LOAN" ? `/loans/${r.target_id}` : "/commodities",
    });
  }

  for (const g of guarantorRequestsForMember(memberId)) {
    const loan = loans.find((l) => l.id === g.loan_id);
    const borrower = loan ? findMember(loan.member_id) : undefined;
    items.push({
      id: `guarantor-${g.id}`,
      title: "Guarantor request",
      description: `${borrower ? `${borrower.first_name} ${borrower.last_name}` : "A member"} asked you to guarantee their loan.`,
      date: g.requested_at,
      tone: "info",
      link: "/loans",
    });
  }

  return items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 10);
}

function adminNotifications(): Notification[] {
  const items: Notification[] = [];

  const pendingDeposits = depositRequests.filter((r) => r.status === "PENDING");
  if (pendingDeposits.length > 0) {
    items.push({
      id: "pending-deposits",
      title: `${pendingDeposits.length} deposit request${pendingDeposits.length === 1 ? "" : "s"} pending`,
      description: "Awaiting your review.",
      date: pendingDeposits[0].submitted_at,
      tone: "info",
      link: "/deposits",
    });
  }

  const pendingWithdrawals = withdrawalRequests.filter((r) => r.status === "PENDING");
  if (pendingWithdrawals.length > 0) {
    items.push({
      id: "pending-withdrawals",
      title: `${pendingWithdrawals.length} withdrawal request${pendingWithdrawals.length === 1 ? "" : "s"} pending`,
      description: "Awaiting your review.",
      date: pendingWithdrawals[0].submitted_at,
      tone: "info",
      link: "/withdrawals",
    });
  }

  const pendingLoans = loans.filter((l) => l.status === "PENDING_ADMIN_APPROVAL");
  if (pendingLoans.length > 0) {
    items.push({
      id: "pending-loans",
      title: `${pendingLoans.length} loan application${pendingLoans.length === 1 ? "" : "s"} pending`,
      description: "Guarantors accepted — awaiting your approval.",
      date: pendingLoans[0].submitted_at,
      tone: "info",
      link: "/loans",
    });
  }

  const pendingCommodities = commodityApplications.filter((a) => a.status === "PENDING");
  if (pendingCommodities.length > 0) {
    items.push({
      id: "pending-commodities",
      title: `${pendingCommodities.length} commodity application${pendingCommodities.length === 1 ? "" : "s"} pending`,
      description: "Awaiting your review.",
      date: pendingCommodities[0].submitted_at,
      tone: "info",
      link: "/commodities",
    });
  }

  const pendingRepayments = repaymentRequests.filter((r) => r.status === "PENDING");
  if (pendingRepayments.length > 0) {
    items.push({
      id: "pending-repayments",
      title: `${pendingRepayments.length} repayment request${pendingRepayments.length === 1 ? "" : "s"} pending`,
      description: "Manual loan/commodity repayments awaiting review.",
      date: pendingRepayments[0].submitted_at,
      tone: "info",
      link: "/loans",
    });
  }

  return items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export async function fetchMyNotifications(role: Role | undefined, memberId: number): Promise<Notification[]> {
  if (isMember(role)) return delay(memberNotifications(memberId), 250);
  if (isAnyAdmin(role)) return delay(adminNotifications(), 250);
  return delay([], 250);
}
