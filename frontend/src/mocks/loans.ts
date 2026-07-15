import type { LoanStatus } from "../lib/types";
import { loanProducts, calculateLoanBreakdown } from "./loanProducts";
import { findMember, totalAsset as memberTotalAsset } from "./members";
import { logAuditEntry } from "./audit";

export interface MockRepayment {
  id: string;
  amount: string;
  paid_at: string;
  is_manual: boolean;
}

export interface MockLoan {
  id: number;
  member_id: number;
  loan_product_id: number;
  top_up_of: number | null;
  principal_granted: string;
  total_asset_snapshot: string;
  interest_rate_applied: number;
  is_interest_override: boolean;
  interest_amount: string;
  fee_amount: string;
  amount_disbursed: string;
  monthly_repayment_amount: string;
  outstanding_balance: string;
  status: LoanStatus;
  submitted_at: string;
  decided_at: string | null;
  decided_by: string | null;
  decision_note: string | null;
  repayments: MockRepayment[];
}

let nextId = 1;

function iso(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function buildLoan(
  memberId: number,
  productId: number,
  principal: number,
  status: LoanStatus,
  submittedDaysAgo: number,
  decidedBy: string | null,
  monthsRepaid: number,
): MockLoan {
  const product = loanProducts.find((p) => p.id === productId)!;
  const member = findMember(memberId)!;
  const asset = Number(memberTotalAsset(member));
  const breakdown = calculateLoanBreakdown(product, principal, asset);
  const monthly = breakdown.monthlyRepayment;
  const repayments: MockRepayment[] = [];
  let outstanding = principal;
  for (let i = 0; i < monthsRepaid; i++) {
    outstanding -= monthly;
    repayments.push({
      id: `${memberId}-${productId}-${i}`,
      amount: monthly.toFixed(2),
      paid_at: iso(submittedDaysAgo - (i + 1) * 30),
      is_manual: false,
    });
  }
  return {
    id: nextId++,
    member_id: memberId,
    loan_product_id: productId,
    top_up_of: null,
    principal_granted: principal.toFixed(2),
    total_asset_snapshot: asset.toFixed(2),
    interest_rate_applied: breakdown.rate,
    is_interest_override: breakdown.isOverride,
    interest_amount: breakdown.interestAmount.toFixed(2),
    fee_amount: breakdown.feeAmount.toFixed(2),
    amount_disbursed: breakdown.amountDisbursed.toFixed(2),
    monthly_repayment_amount: monthly.toFixed(2),
    outstanding_balance: Math.max(0, outstanding).toFixed(2),
    status,
    submitted_at: iso(submittedDaysAgo),
    decided_at: status === "PENDING_GUARANTORS" ? null : iso(Math.max(0, submittedDaysAgo - 1)),
    decided_by: decidedBy,
    decision_note: null,
    repayments: repayments.reverse(),
  };
}

export const loans: MockLoan[] = [
  buildLoan(1, 1, 100000, "ACTIVE", 200, "Amaka Okafor", 4),
  buildLoan(2, 2, 250000, "PENDING_ADMIN_APPROVAL", 5, null, 0),
  buildLoan(3, 1, 60000, "COMPLETED", 400, "Tunde Bakare", 6),
  buildLoan(4, 3, 500000, "PENDING_GUARANTORS", 2, null, 0),
  buildLoan(6, 1, 80000, "REJECTED", 60, "Amaka Okafor", 0),
];

export function findLoan(id: number): MockLoan | undefined {
  return loans.find((l) => l.id === id);
}

export function addLoan(memberId: number, productId: number, principal: number): MockLoan {
  const loan = buildLoan(memberId, productId, principal, "PENDING_GUARANTORS", 0, null, 0);
  loans.unshift(loan);
  return loan;
}

export function decideLoan(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
  decidedBy: string,
): MockLoan | undefined {
  const loan = findLoan(id);
  if (!loan) return undefined;
  loan.status = decision === "APPROVE" ? "ACTIVE" : "REJECTED";
  loan.decided_at = new Date().toISOString();
  loan.decided_by = decidedBy;
  loan.decision_note = note || null;
  logAuditEntry({
    actorName: decidedBy,
    actorRole: "Full admin",
    action: decision === "APPROVE" ? "LOAN_APPROVED" : "LOAN_REJECTED",
    targetMemberId: loan.member_id,
    previousValue: { status: "PENDING_ADMIN_APPROVAL" },
    newValue: { status: loan.status, principal_granted: loan.principal_granted },
    reason: note,
  });
  return loan;
}

export function setLoanStatus(id: number, status: LoanStatus): MockLoan | undefined {
  const loan = findLoan(id);
  if (loan) loan.status = status;
  return loan;
}

/**
 * Proposal §12: an approved manual repayment (full, partial, or early) is
 * added to cumulative repayment and deducted from the outstanding balance;
 * the loan is marked COMPLETED once the balance reaches zero.
 */
export function applyManualLoanRepayment(loanId: number, amount: number): MockLoan | undefined {
  const loan = findLoan(loanId);
  if (!loan) return undefined;
  const newOutstanding = Math.max(0, Number(loan.outstanding_balance) - amount);
  loan.outstanding_balance = newOutstanding.toFixed(2);
  loan.repayments.unshift({
    id: `manual-${loanId}-${Date.now()}`,
    amount: amount.toFixed(2),
    paid_at: new Date().toISOString(),
    is_manual: true,
  });
  if (newOutstanding <= 0) {
    loan.status = "COMPLETED";
  }
  return loan;
}

/**
 * Proposal §14: Amount Disbursed = New Loan Granted − Interest − ₦1,000 Fee
 * − Outstanding Old Loan Balance (the old loan's balance is cleared out of
 * the new loan's proceeds, not paid separately).
 */
export function requestTopUp(
  originalLoanId: number,
  productId: number,
  newPrincipal: number,
): MockLoan | { error: string } {
  const original = findLoan(originalLoanId);
  if (!original) return { error: "Loan not found." };
  const oldOutstanding = Number(original.outstanding_balance);
  if (newPrincipal <= oldOutstanding) {
    return { error: "Top-up amount must be greater than the current outstanding balance." };
  }
  const loan = buildLoan(original.member_id, productId, newPrincipal, "PENDING_GUARANTORS", 0, null, 0);
  loan.top_up_of = originalLoanId;
  loan.amount_disbursed = (Number(loan.amount_disbursed) - oldOutstanding).toFixed(2);
  loans.unshift(loan);
  original.status = "TOPPED_UP";
  logAuditEntry({
    actorName: findMember(original.member_id)?.first_name ?? "Member",
    actorRole: "Member",
    action: "LOAN_TOP_UP_REQUESTED",
    targetMemberId: original.member_id,
    previousValue: { loan_id: originalLoanId, outstanding_balance: original.outstanding_balance },
    newValue: { loan_id: loan.id, principal_granted: loan.principal_granted },
    reason: "",
  });
  return loan;
}
