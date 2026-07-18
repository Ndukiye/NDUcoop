import type { Paginated, ApprovalStatus } from "../../lib/types";
import { currentActorOffice } from "../../lib/actor";
import { delay } from "../../mocks/delay";
import {
  depositRequests,
  addDepositRequest,
  decideDepositRequest,
  type MockDepositRequest,
} from "../../mocks/deposits";
import { findMember } from "../../mocks/members";

export const CURRENT_MEMBER_ID = 1;

export interface DepositRequest extends MockDepositRequest {
  member_name: string;
}

function withMemberName(r: MockDepositRequest): DepositRequest {
  const m = findMember(r.member_id);
  return { ...r, member_name: m ? `${m.first_name} ${m.last_name}` : "Unknown member" };
}

export async function fetchDeposits(params?: {
  status?: ApprovalStatus;
  memberId?: number;
  page?: number;
}): Promise<Paginated<DepositRequest>> {
  const pageSize = 10;
  const page = params?.page ?? 1;
  let filtered = depositRequests;
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

export async function createDepositRequest(input: {
  amount: string;
  note?: string;
  receiptFilename: string | null;
}): Promise<DepositRequest> {
  const req = addDepositRequest(
    CURRENT_MEMBER_ID,
    input.amount,
    input.note ?? "",
    input.receiptFilename,
  );
  return delay(withMemberName(req));
}

export async function decideDeposit(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
): Promise<DepositRequest | null> {
  const req = decideDepositRequest(id, decision, note, currentActorOffice());
  return delay(req ? withMemberName(req) : null);
}
