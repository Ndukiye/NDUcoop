import type { Paginated, MemberStatus } from "../../lib/types";
import { currentActorOffice } from "../../lib/actor";
import { delay } from "../../mocks/delay";
import {
  members,
  findMember,
  addMember,
  updateMemberStatus,
  updateMemberDetails,
  terminateMember,
  totalAsset,
  type MockMember,
} from "../../mocks/members";
import { getMemberLedger, type MockLedgerEntry } from "../../mocks/ledger";

export interface AdminMember extends MockMember {
  total_asset: string;
}

function toAdminMember(m: MockMember): AdminMember {
  return { ...m, total_asset: totalAsset(m) };
}

export async function fetchMembers(params?: {
  search?: string;
  status?: MemberStatus | "";
  page?: number;
}): Promise<Paginated<AdminMember>> {
  const pageSize = 10;
  const page = params?.page ?? 1;
  let filtered = members;
  if (params?.status) {
    filtered = filtered.filter((m) => m.status === params.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.first_name.toLowerCase().includes(q) ||
        m.last_name.toLowerCase().includes(q) ||
        m.membership_id.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }
  const start = (page - 1) * pageSize;
  const results = filtered.slice(start, start + pageSize).map(toAdminMember);
  return delay({
    count: filtered.length,
    next: start + pageSize < filtered.length ? "next" : null,
    previous: page > 1 ? "prev" : null,
    results,
  });
}

export async function fetchMember(id: number): Promise<AdminMember | null> {
  const m = findMember(id);
  return delay(m ? toAdminMember(m) : null);
}

export async function fetchMemberLedger(id: number): Promise<MockLedgerEntry[]> {
  return delay(getMemberLedger(id));
}

export interface OnboardMemberInput {
  first_name: string;
  last_name: string;
  email: string;
  staff_number: string;
  department_unit: string;
  phone: string;
}

export async function onboardMember(input: OnboardMemberInput): Promise<AdminMember> {
  const m = addMember(input);
  return delay(toAdminMember(m));
}

export async function setMemberStatus(
  id: number,
  status: MemberStatus,
  reason: string,
): Promise<AdminMember | null> {
  const m = updateMemberStatus(id, status, reason, currentActorOffice());
  return delay(m ? toAdminMember(m) : null);
}

export interface EditMemberInput {
  phone: string;
  department_unit: string;
  staff_number: string;
}

export async function editMember(id: number, input: EditMemberInput): Promise<AdminMember | null> {
  const m = updateMemberDetails(id, input, currentActorOffice());
  return delay(m ? toAdminMember(m) : null);
}

export async function terminateMemberAccount(
  id: number,
  reason: string,
): Promise<AdminMember | null> {
  const m = terminateMember(id, reason, currentActorOffice());
  return delay(m ? toAdminMember(m) : null);
}
