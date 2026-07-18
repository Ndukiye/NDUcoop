export interface MockAuditEntry {
  id: number;
  actor_name: string;
  actor_role: string;
  action: string;
  target_member_id: number | null;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string;
  created_at: string;
}

let nextId = 1;

function daysAgo(n: number) {
  return new Date(new Date().setDate(new Date().getDate() - n)).toISOString();
}

// Deliberately no imports from other mock files here: every other domain
// (deposits, withdrawals, loans, commodities, members, contributions,
// cooperative settings) logs INTO this module via `logAuditEntry`, so audit
// stays a dependency-free sink -- exactly like the real `audit` app in the
// architecture plan, which only `core`/`members` depend on, never the other
// way around. Seed data below is hardcoded rather than derived from other
// mocks' initial arrays to avoid a circular import.
export const auditEntries: MockAuditEntry[] = [
  {
    id: nextId++,
    actor_name: "President",
    actor_role: "Full admin",
    action: "DEPOSIT_APPROVED",
    target_member_id: 3,
    previous_value: { status: "PENDING" },
    new_value: { status: "APPROVED", amount: "15000.00" },
    reason: "Confirmed with finance",
    created_at: daysAgo(9),
  },
  {
    id: nextId++,
    actor_name: "Treasurer",
    actor_role: "Full admin",
    action: "DEPOSIT_REJECTED",
    target_member_id: 4,
    previous_value: { status: "PENDING" },
    new_value: { status: "REJECTED", amount: "120000.00" },
    reason: "Amount exceeds verified income for this period",
    created_at: daysAgo(19),
  },
  {
    id: nextId++,
    actor_name: "President",
    actor_role: "Full admin",
    action: "WITHDRAWAL_APPROVED",
    target_member_id: 3,
    previous_value: { status: "PENDING" },
    new_value: { status: "APPROVED", amount: "10000.00" },
    reason: "",
    created_at: daysAgo(14),
  },
  {
    id: nextId++,
    actor_name: "Treasurer",
    actor_role: "Full admin",
    action: "WITHDRAWAL_REJECTED",
    target_member_id: 1,
    previous_value: { status: "PENDING" },
    new_value: { status: "REJECTED", amount: "60000.00" },
    reason: "Exceeds available deposit balance at the time",
    created_at: daysAgo(24),
  },
  {
    id: nextId++,
    actor_name: "President",
    actor_role: "Full admin",
    action: "LOAN_APPROVED",
    target_member_id: 1,
    previous_value: { status: "PENDING_ADMIN_APPROVAL" },
    new_value: { status: "ACTIVE", principal_granted: "100000.00" },
    reason: "",
    created_at: daysAgo(200),
  },
  {
    id: nextId++,
    actor_name: "Treasurer",
    actor_role: "Full admin",
    action: "MEMBER_STATUS_CHANGED",
    target_member_id: 24,
    previous_value: { status: "ACTIVE" },
    new_value: { status: "SUSPENDED" },
    reason: "Repeated missed monthly contributions",
    created_at: daysAgo(12),
  },
  {
    id: nextId++,
    actor_name: "President",
    actor_role: "Full admin",
    action: "MEMBER_STATUS_CHANGED",
    target_member_id: 26,
    previous_value: { status: "SUSPENDED" },
    new_value: { status: "TERMINATED" },
    reason: "Left the cooperative's parent organization",
    created_at: daysAgo(5),
  },
  {
    id: nextId++,
    actor_name: "President",
    actor_role: "Full admin",
    action: "MEMBER_STATUS_CHANGED",
    target_member_id: 22,
    previous_value: { status: "ACTIVE" },
    new_value: { status: "RETIRED" },
    reason: "Retirement from service",
    created_at: daysAgo(90),
  },
  {
    id: nextId++,
    actor_name: "President",
    actor_role: "Full admin",
    action: "MEMBER_STATUS_CHANGED",
    target_member_id: 23,
    previous_value: { status: "ACTIVE" },
    new_value: { status: "RETIRED" },
    reason: "Retirement from service",
    created_at: daysAgo(90),
  },
  {
    id: nextId++,
    actor_name: "Ebiere Owei",
    actor_role: "Member",
    action: "BANK_DETAILS_UPDATED",
    target_member_id: 1,
    previous_value: { bank_name: "GTBank", bank_account_number: "0119283746" },
    new_value: { bank_name: "First Bank", bank_account_number: "1000009137" },
    reason: "Member-initiated update",
    created_at: daysAgo(100),
  },
  {
    id: nextId++,
    actor_name: "President",
    actor_role: "Full admin",
    action: "MEMBER_ONBOARDED",
    target_member_id: 1,
    previous_value: null,
    new_value: { membership_id: "NDU-0001", department_unit: "Finance" },
    reason: "",
    created_at: daysAgo(400),
  },
  {
    id: nextId++,
    actor_name: "President",
    actor_role: "Full admin",
    action: "MEMBER_ONBOARDED",
    target_member_id: 2,
    previous_value: null,
    new_value: { membership_id: "NDU-0002", department_unit: "Engineering" },
    reason: "",
    created_at: daysAgo(700),
  },
];

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  DEPOSIT_APPROVED: "Deposit approved",
  DEPOSIT_REJECTED: "Deposit rejected",
  WITHDRAWAL_APPROVED: "Withdrawal approved",
  WITHDRAWAL_REJECTED: "Withdrawal rejected",
  LOAN_APPROVED: "Loan approved",
  LOAN_REJECTED: "Loan rejected",
  LOAN_TOP_UP_REQUESTED: "Loan top-up requested",
  LOAN_REPAYMENT_APPROVED: "Loan repayment approved",
  LOAN_REPAYMENT_REVERSED: "Loan repayment reversed",
  LOAN_REPAYMENT_REJECTED: "Loan repayment rejected",
  COMMODITY_APPROVED: "Commodity application approved",
  COMMODITY_REJECTED: "Commodity application rejected",
  COMMODITY_REPAYMENT_APPROVED: "Commodity repayment approved",
  COMMODITY_REPAYMENT_REJECTED: "Commodity repayment rejected",
  MEMBER_ONBOARDED: "Member onboarded",
  MEMBER_EDITED: "Member details edited",
  MEMBER_STATUS_CHANGED: "Member status changed",
  MEMBER_ASSET_CLEARED: "Member balances cleared",
  BANK_DETAILS_UPDATED: "Bank details updated",
  CONTRIBUTION_POSTED: "Contributions posted",
  CONTRIBUTION_CORRECTED: "Contribution corrected",
  SYSTEM_SETTING_CHANGED: "System setting changed",
  REPORT_GENERATED: "Report generated",
};

export function logAuditEntry(input: {
  actorName: string;
  actorRole: string;
  action: string;
  targetMemberId?: number | null;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  reason?: string;
}): void {
  auditEntries.unshift({
    id: nextId++,
    actor_name: input.actorName,
    actor_role: input.actorRole,
    action: input.action,
    target_member_id: input.targetMemberId ?? null,
    previous_value: input.previousValue ?? null,
    new_value: input.newValue ?? null,
    reason: input.reason ?? "",
    created_at: new Date().toISOString(),
  });
}
