import { findMemberByMembershipId } from "../../mocks/members";

export interface MemberLookupResult {
  member?: { id: number; first_name: string; last_name: string };
  error?: string;
}

export function lookupMemberByMembershipId(membershipId: string): MemberLookupResult {
  if (!membershipId.trim()) return {};
  const member = findMemberByMembershipId(membershipId);
  if (!member) return { error: "No member found with that membership ID." };
  return {
    member: { id: member.id, first_name: member.first_name, last_name: member.last_name },
  };
}
