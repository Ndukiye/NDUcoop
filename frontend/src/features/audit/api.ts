import type { Paginated } from "../../lib/types";
import { delay } from "../../mocks/delay";
import { auditEntries, AUDIT_ACTION_LABELS, type MockAuditEntry } from "../../mocks/audit";
import { findMember } from "../../mocks/members";

export interface AuditEntry extends MockAuditEntry {
  target_member_name: string | null;
}

function withMemberName(e: MockAuditEntry): AuditEntry {
  const m = e.target_member_id ? findMember(e.target_member_id) : undefined;
  return { ...e, target_member_name: m ? `${m.first_name} ${m.last_name}` : null };
}

export async function fetchAuditLog(params?: {
  action?: string;
  search?: string;
  page?: number;
}): Promise<Paginated<AuditEntry>> {
  const pageSize = 10;
  const page = params?.page ?? 1;
  let filtered = auditEntries;
  if (params?.action) filtered = filtered.filter((e) => e.action === params.action);
  if (params?.search?.trim()) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter((e) => {
      const target = e.target_member_id ? findMember(e.target_member_id) : undefined;
      const targetName = target ? `${target.first_name} ${target.last_name}` : "";
      return (
        e.actor_name.toLowerCase().includes(q) ||
        targetName.toLowerCase().includes(q) ||
        e.reason.toLowerCase().includes(q)
      );
    });
  }
  const start = (page - 1) * pageSize;
  const results = filtered.slice(start, start + pageSize).map(withMemberName);
  return delay({
    count: filtered.length,
    next: start + pageSize < filtered.length ? "next" : null,
    previous: page > 1 ? "prev" : null,
    results,
  });
}

export const auditActions = Object.keys(AUDIT_ACTION_LABELS);
export { AUDIT_ACTION_LABELS };
