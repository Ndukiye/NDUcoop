import type { GuarantorStatus } from "../lib/types";
import { setLoanStatus } from "./loans";

export interface MockGuarantorRequest {
  id: number;
  loan_id: number;
  guarantor_member_id: number;
  status: GuarantorStatus;
  requested_at: string;
  responded_at: string | null;
  withdrawal_lock_until: string | null;
}

let nextId = 1;

export const guarantorRequests: MockGuarantorRequest[] = [];

function seedFor(loanId: number, guarantorMemberIds: number[], acceptedCount: number) {
  guarantorMemberIds.forEach((memberId, i) => {
    const status: GuarantorStatus = i < acceptedCount ? "ACCEPTED" : "PENDING";
    guarantorRequests.push({
      id: nextId++,
      loan_id: loanId,
      guarantor_member_id: memberId,
      status,
      requested_at: new Date().toISOString(),
      responded_at: status === "ACCEPTED" ? new Date().toISOString() : null,
      withdrawal_lock_until:
        status === "ACCEPTED" ? new Date(Date.now() + 45 * 60_000).toISOString() : null,
    });
  });
}

seedFor(1, [7, 8], 2);
seedFor(2, [9, 10], 2);
seedFor(4, [2, 3], 1);

export function guarantorRequestsForLoan(loanId: number): MockGuarantorRequest[] {
  return guarantorRequests.filter((r) => r.loan_id === loanId);
}

export function guarantorRequestsForMember(memberId: number): MockGuarantorRequest[] {
  return guarantorRequests.filter((r) => r.guarantor_member_id === memberId && r.status === "PENDING");
}

export function createGuarantorRequestsForLoan(
  loanId: number,
  guarantorMemberIds: number[],
): MockGuarantorRequest[] {
  return guarantorMemberIds.map((memberId) => {
    const req: MockGuarantorRequest = {
      id: nextId++,
      loan_id: loanId,
      guarantor_member_id: memberId,
      status: "PENDING",
      requested_at: new Date().toISOString(),
      responded_at: null,
      withdrawal_lock_until: null,
    };
    guarantorRequests.push(req);
    return req;
  });
}

export function respondToGuarantorRequest(
  id: number,
  accept: boolean,
): MockGuarantorRequest | undefined {
  const req = guarantorRequests.find((r) => r.id === id);
  if (!req) return undefined;
  req.status = accept ? "ACCEPTED" : "REJECTED";
  req.responded_at = new Date().toISOString();
  if (accept) {
    req.withdrawal_lock_until = new Date(Date.now() + 45 * 60_000).toISOString();
  }

  const loanReqs = guarantorRequestsForLoan(req.loan_id);
  if (!accept) {
    setLoanStatus(req.loan_id, "REJECTED");
  } else if (loanReqs.length >= 2 && loanReqs.every((r) => r.status === "ACCEPTED")) {
    setLoanStatus(req.loan_id, "PENDING_ADMIN_APPROVAL");
  }

  return req;
}
