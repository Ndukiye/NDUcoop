import type { Paginated, ApprovalStatus } from "../../lib/types";
import { delay } from "../../mocks/delay";
import {
  withdrawalRequests,
  addWithdrawalRequest,
  decideWithdrawalRequest,
  getWithdrawalEligibility,
  type MockWithdrawalRequest,
  type WithdrawalEligibility,
} from "../../mocks/withdrawals";
import { findMember } from "../../mocks/members";

export const CURRENT_MEMBER_ID = 1;

export interface WithdrawalRequest extends MockWithdrawalRequest {
  member_name: string;
}

function withMemberName(r: MockWithdrawalRequest): WithdrawalRequest {
  const m = findMember(r.member_id);
  return { ...r, member_name: m ? `${m.first_name} ${m.last_name}` : "Unknown member" };
}

export async function fetchWithdrawals(params?: {
  status?: ApprovalStatus;
  memberId?: number;
  page?: number;
}): Promise<Paginated<WithdrawalRequest>> {
  const pageSize = 10;
  const page = params?.page ?? 1;
  let filtered = withdrawalRequests;
  if (params?.status) filtered = filtered.filter((r) => r.status === params.status);
  if (params?.memberId) filtered = filtered.filter((r) => r.member_id === params.memberId);
  const start = (page - 1) * pageSize;
  const results = filtered.slice(start, start + pageSize).map(withMemberName);
  return delay({
    count: filtered.length,
    next: start + pageSize < filtered.length ? "next" : null,
    previous: page > 1 ? "prev" : null,
    results,
  });
}

export async function fetchWithdrawalEligibility(memberId: number): Promise<WithdrawalEligibility> {
  return delay(getWithdrawalEligibility(memberId), 200);
}

export async function createWithdrawalRequest(input: {
  amount: string;
  note?: string;
  payoutBankName: string;
  payoutAccountName: string;
  payoutAccountNumber: string;
}): Promise<WithdrawalRequest> {
  const req = addWithdrawalRequest(
    CURRENT_MEMBER_ID,
    input.amount,
    input.note ?? "",
    input.payoutBankName,
    input.payoutAccountName,
    input.payoutAccountNumber,
  );
  return delay(withMemberName(req));
}

export async function decideWithdrawal(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
): Promise<WithdrawalRequest | null> {
  const req = decideWithdrawalRequest(id, decision, note, "Current admin");
  return delay(req ? withMemberName(req) : null);
}
