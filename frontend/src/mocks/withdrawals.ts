import type { ApprovalStatus } from "../lib/types";
import { findMember, totalAsset } from "./members";
import { loans } from "./loans";
import { logAuditEntry } from "./audit";

export interface MockWithdrawalRequest {
  id: number;
  member_id: number;
  amount: string;
  note: string;
  payout_bank_name: string;
  payout_account_name: string;
  payout_account_number: string;
  status: ApprovalStatus;
  submitted_at: string;
  decided_at: string | null;
  decided_by: string | null;
  decision_note: string | null;
}

let nextId = 1;

function iso(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export const withdrawalRequests: MockWithdrawalRequest[] = [
  {
    id: nextId++,
    member_id: 1,
    amount: "15000.00",
    note: "Medical expense",
    payout_bank_name: "First Bank of Nigeria",
    payout_account_name: "Ebiere Owei",
    payout_account_number: "1111111111",
    status: "PENDING",
    submitted_at: iso(1),
    decided_at: null,
    decided_by: null,
    decision_note: null,
  },
  {
    id: nextId++,
    member_id: 2,
    amount: "40000.00",
    note: "",
    payout_bank_name: "Guaranty Trust Bank (GTBank)",
    payout_account_name: "Preye Ekiyor",
    payout_account_number: "1111111111",
    status: "PENDING",
    submitted_at: iso(2),
    decided_at: null,
    decided_by: null,
    decision_note: null,
  },
  {
    id: nextId++,
    member_id: 3,
    amount: "10000.00",
    note: "",
    payout_bank_name: "Zenith Bank",
    payout_account_name: "Tonbra Seiyefa",
    payout_account_number: "1111111111",
    status: "APPROVED",
    submitted_at: iso(15),
    decided_at: iso(14),
    decided_by: "President",
    decision_note: null,
  },
  {
    id: nextId++,
    member_id: 1,
    amount: "60000.00",
    note: "School fees",
    payout_bank_name: "First Bank of Nigeria",
    payout_account_name: "Ebiere Owei",
    payout_account_number: "1111111111",
    status: "REJECTED",
    submitted_at: iso(25),
    decided_at: iso(24),
    decided_by: "Treasurer",
    decision_note: "Exceeds available deposit balance at the time",
  },
  {
    id: nextId++,
    member_id: 6,
    amount: "22000.00",
    note: "",
    payout_bank_name: "Access Bank",
    payout_account_name: "Boma Warmate",
    payout_account_number: "1111111111",
    status: "APPROVED",
    submitted_at: iso(40),
    decided_at: iso(39),
    decided_by: "President",
    decision_note: null,
  },
];

export function addWithdrawalRequest(
  memberId: number,
  amount: string,
  note: string,
  payoutBankName: string,
  payoutAccountName: string,
  payoutAccountNumber: string,
): MockWithdrawalRequest {
  const req: MockWithdrawalRequest = {
    id: nextId++,
    member_id: memberId,
    amount,
    note,
    payout_bank_name: payoutBankName,
    payout_account_name: payoutAccountName,
    payout_account_number: payoutAccountNumber,
    status: "PENDING",
    submitted_at: new Date().toISOString(),
    decided_at: null,
    decided_by: null,
    decision_note: null,
  };
  withdrawalRequests.unshift(req);
  return req;
}

export function decideWithdrawalRequest(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
  decidedBy: string,
): MockWithdrawalRequest | undefined {
  const req = withdrawalRequests.find((r) => r.id === id);
  if (!req) return undefined;
  req.status = decision === "APPROVE" ? "APPROVED" : "REJECTED";
  req.decided_at = new Date().toISOString();
  req.decided_by = decidedBy;
  req.decision_note = note || null;
  logAuditEntry({
    actorName: decidedBy,
    actorRole: "Full admin",
    action: decision === "APPROVE" ? "WITHDRAWAL_APPROVED" : "WITHDRAWAL_REJECTED",
    targetMemberId: req.member_id,
    previousValue: { status: "PENDING" },
    newValue: { status: req.status, amount: req.amount },
    reason: note,
  });
  return req;
}

export interface WithdrawalEligibility {
  cap: number;
  hasActiveLoan: boolean;
  eligible: boolean;
  outstandingLoanBalance: number;
  totalAsset: number;
}

/**
 * Proposal §8: members without an active loan can withdraw their full deposit
 * balance. A member with an active loan may only withdraw when their
 * outstanding loan balance is less than their total asset, and the amount is
 * further capped at min(deposit_balance, total_asset - outstanding_loan).
 */
export function getWithdrawalEligibility(memberId: number): WithdrawalEligibility {
  const member = findMember(memberId);
  if (!member) {
    return { cap: 0, hasActiveLoan: false, eligible: false, outstandingLoanBalance: 0, totalAsset: 0 };
  }
  const activeLoan = loans.find((l) => l.member_id === memberId && l.status === "ACTIVE");
  const asset = Number(totalAsset(member));
  const depositBalance = Number(member.deposit_balance);

  if (!activeLoan) {
    return { cap: depositBalance, hasActiveLoan: false, eligible: true, outstandingLoanBalance: 0, totalAsset: asset };
  }

  const outstanding = Number(activeLoan.outstanding_balance);
  const eligible = outstanding < asset;
  const cap = eligible ? Math.max(0, Math.min(depositBalance, asset - outstanding)) : 0;
  return { cap, hasActiveLoan: true, eligible, outstandingLoanBalance: outstanding, totalAsset: asset };
}
