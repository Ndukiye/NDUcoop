import type { ApprovalStatus } from "../lib/types";
import { applyManualLoanRepayment } from "./loans";
import { applyManualCommodityRepayment } from "./commodities";
import { logAuditEntry } from "./audit";

export type RepaymentTargetType = "LOAN" | "COMMODITY";

export interface MockRepaymentRequest {
  id: number;
  target_type: RepaymentTargetType;
  target_id: number;
  member_id: number;
  amount: string;
  receipt_filename: string | null;
  note: string;
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

export const repaymentRequests: MockRepaymentRequest[] = [
  {
    id: nextId++,
    target_type: "LOAN",
    target_id: 1,
    member_id: 1,
    amount: "10000.00",
    receipt_filename: "loan-repayment-receipt.pdf",
    note: "Early repayment ahead of this month's salary deduction",
    status: "PENDING",
    submitted_at: iso(1),
    decided_at: null,
    decided_by: null,
    decision_note: null,
  },
  {
    id: nextId++,
    target_type: "COMMODITY",
    target_id: 2,
    member_id: 3,
    amount: "7666.67",
    receipt_filename: "commodity-repayment-receipt.jpg",
    note: "",
    status: "PENDING",
    submitted_at: iso(2),
    decided_at: null,
    decided_by: null,
    decision_note: null,
  },
  {
    id: nextId++,
    target_type: "LOAN",
    target_id: 3,
    member_id: 3,
    amount: "10000.00",
    receipt_filename: "receipt-loan3.pdf",
    note: "Partial repayment",
    status: "APPROVED",
    submitted_at: iso(20),
    decided_at: iso(19),
    decided_by: "President",
    decision_note: null,
  },
];

export function addRepaymentRequest(input: {
  targetType: RepaymentTargetType;
  targetId: number;
  memberId: number;
  amount: string;
  receiptFilename: string | null;
  note: string;
}): MockRepaymentRequest {
  const req: MockRepaymentRequest = {
    id: nextId++,
    target_type: input.targetType,
    target_id: input.targetId,
    member_id: input.memberId,
    amount: input.amount,
    receipt_filename: input.receiptFilename,
    note: input.note,
    status: "PENDING",
    submitted_at: new Date().toISOString(),
    decided_at: null,
    decided_by: null,
    decision_note: null,
  };
  repaymentRequests.unshift(req);
  return req;
}

export function decideRepaymentRequest(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
  decidedBy: string,
): MockRepaymentRequest | undefined {
  const req = repaymentRequests.find((r) => r.id === id);
  if (!req) return undefined;
  req.status = decision === "APPROVE" ? "APPROVED" : "REJECTED";
  req.decided_at = new Date().toISOString();
  req.decided_by = decidedBy;
  req.decision_note = note || null;

  if (decision === "APPROVE") {
    if (req.target_type === "LOAN") {
      applyManualLoanRepayment(req.target_id, Number(req.amount));
    } else {
      applyManualCommodityRepayment(req.target_id, Number(req.amount));
    }
  }

  const isLoan = req.target_type === "LOAN";
  logAuditEntry({
    actorName: decidedBy,
    actorRole: "Full admin",
    action:
      decision === "APPROVE"
        ? isLoan
          ? "LOAN_REPAYMENT_APPROVED"
          : "COMMODITY_REPAYMENT_APPROVED"
        : isLoan
          ? "LOAN_REPAYMENT_REJECTED"
          : "COMMODITY_REPAYMENT_REJECTED",
    targetMemberId: req.member_id,
    previousValue: { status: "PENDING" },
    newValue: { status: req.status, amount: req.amount },
    reason: note,
  });

  return req;
}

export function repaymentRequestsForTarget(
  targetType: RepaymentTargetType,
  targetId: number,
): MockRepaymentRequest[] {
  return repaymentRequests.filter((r) => r.target_type === targetType && r.target_id === targetId);
}
