import type { Paginated, LoanStatus } from "../../lib/types";
import { currentActorOffice } from "../../lib/actor";
import { delay } from "../../mocks/delay";
import { loanProducts, calculateLoanBreakdown, type MockLoanProduct } from "../../mocks/loanProducts";
import {
  loans,
  findLoan,
  addLoan,
  decideLoan,
  requestTopUp,
  reverseLoanRepayment,
  type MockLoan,
} from "../../mocks/loans";
import { guarantorRequestsForLoan, createGuarantorRequestsForLoan, type MockGuarantorRequest } from "../../mocks/guarantors";
import { findMember, findMemberByMembershipId, totalAsset as memberTotalAsset } from "../../mocks/members";
import {
  repaymentRequests,
  addRepaymentRequest,
  decideRepaymentRequest,
  repaymentRequestsForTarget,
} from "../../mocks/repayments";
import type { EnrichedRepaymentRequest } from "../shared/RepaymentRequestsQueue";

export const CURRENT_MEMBER_ID = 1;

export const OPEN_LOAN_STATUSES: LoanStatus[] = [
  "PENDING_GUARANTORS",
  "PENDING_ADMIN_APPROVAL",
  "ACTIVE",
];

export interface LoanWithMember extends MockLoan {
  member_name: string;
  product_name: string;
}

function enrich(l: MockLoan): LoanWithMember {
  const m = findMember(l.member_id);
  const p = loanProducts.find((pr) => pr.id === l.loan_product_id);
  return {
    ...l,
    member_name: m ? `${m.first_name} ${m.last_name}` : "Unknown member",
    product_name: p?.name ?? "Unknown product",
  };
}

export async function fetchLoanProducts(): Promise<MockLoanProduct[]> {
  return delay(loanProducts);
}

export async function fetchMyLoans(): Promise<LoanWithMember[]> {
  return delay(loans.filter((l) => l.member_id === CURRENT_MEMBER_ID).map(enrich));
}

export async function fetchLoan(id: number): Promise<LoanWithMember | null> {
  const l = findLoan(id);
  return delay(l ? enrich(l) : null);
}

export async function fetchLoanGuarantors(id: number): Promise<MockGuarantorRequest[]> {
  return delay(guarantorRequestsForLoan(id));
}

export async function fetchLoanApplications(params?: {
  status?: LoanStatus;
}): Promise<Paginated<LoanWithMember>> {
  let filtered = loans;
  if (params?.status) filtered = filtered.filter((l) => l.status === params.status);
  const results = filtered.map(enrich);
  return delay({ count: results.length, next: null, previous: null, results });
}

export function previewLoanBreakdown(productId: number, principal: number) {
  const product = loanProducts.find((p) => p.id === productId);
  if (!product) return null;
  const member = findMember(CURRENT_MEMBER_ID)!;
  const asset = Number(memberTotalAsset(member));
  return calculateLoanBreakdown(product, principal, asset);
}

export interface GuarantorLookupResult {
  member?: { id: number; first_name: string; last_name: string; department_unit: string };
  error?: string;
}

/**
 * Proposal §13: the applicant enters a guarantor's membership ID and the
 * system resolves it to a name for confirmation — not a pick-from-a-list of
 * every member (which wouldn't scale to the proposal's 5,000-member target).
 */
export function lookupGuarantorByMembershipId(membershipId: string): GuarantorLookupResult {
  if (!membershipId.trim()) return {};
  const member = findMemberByMembershipId(membershipId);
  if (!member) return { error: "No member found with that membership ID." };
  if (member.id === CURRENT_MEMBER_ID) return { error: "You can't name yourself as a guarantor." };
  if (member.status !== "ACTIVE") return { error: "This member's account isn't active." };
  return {
    member: {
      id: member.id,
      first_name: member.first_name,
      last_name: member.last_name,
      department_unit: member.department_unit,
    },
  };
}

export async function applyForLoan(input: {
  productId: number;
  principal: number;
  guarantorIds: number[];
}): Promise<LoanWithMember> {
  const loan = addLoan(CURRENT_MEMBER_ID, input.productId, input.principal);
  createGuarantorRequestsForLoan(loan.id, input.guarantorIds);
  return delay(enrich(loan));
}

export async function decideLoanApplication(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
): Promise<LoanWithMember | null> {
  const loan = decideLoan(id, decision, note, currentActorOffice());
  return delay(loan ? enrich(loan) : null);
}

export async function submitTopUp(
  loanId: number,
  productId: number,
  newPrincipal: number,
  guarantorIds: number[],
): Promise<LoanWithMember | { error: string }> {
  const original = findLoan(loanId);
  if (!original) return delay({ error: "Loan not found." });
  const result = requestTopUp(loanId, productId, newPrincipal);
  if ("error" in result) return delay(result);
  createGuarantorRequestsForLoan(result.id, guarantorIds);
  return delay(enrich(result));
}

export async function submitLoanRepaymentRequest(input: {
  loanId: number;
  amount: string;
  note: string;
  receiptFilename: string;
}): Promise<void> {
  addRepaymentRequest({
    targetType: "LOAN",
    targetId: input.loanId,
    memberId: CURRENT_MEMBER_ID,
    amount: input.amount,
    receiptFilename: input.receiptFilename,
    note: input.note,
  });
  return delay(undefined);
}

function enrichRepayment(r: (typeof repaymentRequests)[number]): EnrichedRepaymentRequest {
  const m = findMember(r.member_id);
  return {
    id: r.id,
    member_name: m ? `${m.first_name} ${m.last_name}` : "Unknown member",
    amount: r.amount,
    receipt_filename: r.receipt_filename,
    note: r.note,
    status: r.status,
    submitted_at: r.submitted_at,
    decided_at: r.decided_at,
    decided_by: r.decided_by,
    decision_note: r.decision_note,
  };
}

export async function fetchLoanRepaymentRequestsForLoan(
  loanId: number,
): Promise<EnrichedRepaymentRequest[]> {
  return delay(repaymentRequestsForTarget("LOAN", loanId).map(enrichRepayment));
}

export async function fetchLoanRepaymentQueue(): Promise<EnrichedRepaymentRequest[]> {
  return delay(repaymentRequests.filter((r) => r.target_type === "LOAN").map(enrichRepayment));
}

export async function decideLoanRepaymentRequest(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
): Promise<void> {
  decideRepaymentRequest(id, decision, note, currentActorOffice());
  return delay(undefined);
}

export async function reverseRepayment(
  loanId: number,
  repaymentId: string,
  reason: string,
): Promise<LoanWithMember | null> {
  const loan = reverseLoanRepayment(loanId, repaymentId, reason, currentActorOffice());
  return delay(loan ? enrich(loan) : null);
}
