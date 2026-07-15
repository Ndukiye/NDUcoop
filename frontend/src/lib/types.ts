export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LoanStatus =
  | "PENDING_GUARANTORS"
  | "PENDING_ADMIN_APPROVAL"
  | "ACTIVE"
  | "COMPLETED"
  | "REJECTED"
  | "TOPPED_UP"
  | "DEFAULTED";

export type GuarantorStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type MemberStatus = "ACTIVE" | "INACTIVE" | "RETIRED" | "SUSPENDED" | "TERMINATED";

export type LedgerCategory =
  | "SHARES"
  | "WELFARE"
  | "COMPULSORY_SAVINGS"
  | "DEPOSIT"
  | "LOAN_DISBURSEMENT"
  | "LOAN_REPAYMENT"
  | "COMMODITY_PAYMENT"
  | "OPENING_BALANCE"
  | "OTHER";

export interface DecisionInput {
  decision: "APPROVE" | "REJECT";
  note?: string;
}
