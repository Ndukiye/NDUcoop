import type { ApprovalStatus } from "../lib/types";
import { logAuditEntry } from "./audit";

export interface MockDepositRequest {
  id: number;
  member_id: number;
  amount: string;
  note: string;
  receipt_filename: string | null;
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

export const depositRequests: MockDepositRequest[] = [
  {
    id: nextId++,
    member_id: 1,
    amount: "20000.00",
    note: "Salary bonus top-up",
    receipt_filename: "deposit-receipt-20000.pdf",
    status: "PENDING",
    submitted_at: iso(1),
    decided_at: null,
    decided_by: null,
    decision_note: null,
  },
  {
    id: nextId++,
    member_id: 2,
    amount: "50000.00",
    note: "",
    receipt_filename: "bank-transfer-receipt.jpg",
    status: "PENDING",
    submitted_at: iso(2),
    decided_at: null,
    decided_by: null,
    decision_note: null,
  },
  {
    id: nextId++,
    member_id: 3,
    amount: "15000.00",
    note: "Extra savings",
    receipt_filename: "receipt-15000.pdf",
    status: "APPROVED",
    submitted_at: iso(10),
    decided_at: iso(9),
    decided_by: "President",
    decision_note: "Confirmed with finance",
  },
  {
    id: nextId++,
    member_id: 1,
    amount: "8000.00",
    note: "",
    receipt_filename: "receipt-8000.pdf",
    status: "APPROVED",
    submitted_at: iso(35),
    decided_at: iso(34),
    decided_by: "President",
    decision_note: null,
  },
  {
    id: nextId++,
    member_id: 4,
    amount: "120000.00",
    note: "Year-end deposit",
    receipt_filename: "year-end-deposit-slip.png",
    status: "REJECTED",
    submitted_at: iso(20),
    decided_at: iso(19),
    decided_by: "Treasurer",
    decision_note: "Amount exceeds verified income for this period",
  },
  {
    id: nextId++,
    member_id: 5,
    amount: "30000.00",
    note: "",
    receipt_filename: "receipt-30000.pdf",
    status: "PENDING",
    submitted_at: iso(0.3),
    decided_at: null,
    decided_by: null,
    decision_note: null,
  },
  {
    id: nextId++,
    member_id: 6,
    amount: "25000.00",
    note: "Gift deposit",
    receipt_filename: "gift-deposit-receipt.pdf",
    status: "APPROVED",
    submitted_at: iso(48),
    decided_at: iso(47),
    decided_by: "President",
    decision_note: null,
  },
  {
    id: nextId++,
    member_id: 1,
    amount: "12000.00",
    note: "",
    receipt_filename: "receipt-12000-dup.pdf",
    status: "REJECTED",
    submitted_at: iso(60),
    decided_at: iso(59),
    decided_by: "Treasurer",
    decision_note: "Duplicate of an already-posted deposit",
  },
];

export function addDepositRequest(
  memberId: number,
  amount: string,
  note: string,
  receiptFilename: string | null,
): MockDepositRequest {
  const req: MockDepositRequest = {
    id: nextId++,
    member_id: memberId,
    amount,
    note,
    receipt_filename: receiptFilename,
    status: "PENDING",
    submitted_at: new Date().toISOString(),
    decided_at: null,
    decided_by: null,
    decision_note: null,
  };
  depositRequests.unshift(req);
  return req;
}

export function decideDepositRequest(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
  decidedBy: string,
): MockDepositRequest | undefined {
  const req = depositRequests.find((r) => r.id === id);
  if (!req) return undefined;
  req.status = decision === "APPROVE" ? "APPROVED" : "REJECTED";
  req.decided_at = new Date().toISOString();
  req.decided_by = decidedBy;
  req.decision_note = note || null;
  logAuditEntry({
    actorName: decidedBy,
    actorRole: "Full admin",
    action: decision === "APPROVE" ? "DEPOSIT_APPROVED" : "DEPOSIT_REJECTED",
    targetMemberId: req.member_id,
    previousValue: { status: "PENDING" },
    newValue: { status: req.status, amount: req.amount },
    reason: note,
  });
  return req;
}
