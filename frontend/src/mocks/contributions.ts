import { logAuditEntry } from "./audit";
import { members } from "./members";
import { currentActorOffice } from "../lib/actor";

export interface MockContributionBatch {
  id: number;
  month: string;
  posted_at: string;
  posted_by: string;
  member_count: number;
  total_amount: string;
}

let nextId = 1;

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

export const contributionBatches: MockContributionBatch[] = Array.from({ length: 6 }).map(
  (_, i) => {
    const d = monthsAgo(i + 1);
    const memberCount = 24 + i;
    return {
      id: nextId++,
      month: monthLabel(d),
      posted_at: new Date(d.getFullYear(), d.getMonth(), 26).toISOString(),
      posted_by: "President",
      member_count: memberCount,
      total_amount: (memberCount * 10200).toFixed(2),
    };
  },
);

/**
 * One editable line per active member in the pre-posting review. The fixed
 * split (Shares 7,000 / Welfare 200 / Compulsory 3,000) always comes out of
 * `amount`; anything above the 10,200 minimum lands in Deposits. Admins can
 * adjust the amount per member (e.g. someone paid extra) or exclude members
 * who didn't pay this month before the batch is posted.
 */
export interface MockPostingRow {
  member_id: number;
  membership_id: string;
  name: string;
  amount: string;
  included: boolean;
}

// Proposal §6/§25: posting copies each member's previous-month contribution
// forward so the admin only edits increases/decreases. Seeded at the minimum;
// updated every time a batch is posted.
const lastPostedAmounts = new Map<number, string>();

export function prepareMonthlyPosting(): MockPostingRow[] {
  return members
    .filter((m) => m.status === "ACTIVE")
    .map((m) => ({
      member_id: m.id,
      membership_id: m.membership_id,
      name: `${m.first_name} ${m.last_name}`,
      amount: lastPostedAmounts.get(m.id) ?? "10200.00",
      included: true,
    }));
}

export function currentPostingMonth(): string {
  return monthLabel(new Date());
}

export function postContributionBatch(
  rows: { memberId: number; amount: string }[],
): MockContributionBatch {
  const now = new Date();
  const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);
  for (const r of rows) lastPostedAmounts.set(r.memberId, r.amount);
  const batch: MockContributionBatch = {
    id: nextId++,
    month: monthLabel(now),
    posted_at: now.toISOString(),
    posted_by: currentActorOffice(),
    member_count: rows.length,
    total_amount: total.toFixed(2),
  };
  contributionBatches.unshift(batch);
  logAuditEntry({
    actorName: batch.posted_by,
    actorRole: "Full admin",
    action: "CONTRIBUTION_POSTED",
    targetMemberId: null,
    previousValue: null,
    newValue: { month: batch.month, member_count: batch.member_count, total_amount: batch.total_amount },
    reason: "",
  });
  return batch;
}

export interface MockContributionCorrection {
  id: number;
  batch_id: number;
  member_id: number;
  amount: string;
  reason: string;
  corrected_by: string;
  corrected_at: string;
}

let nextCorrectionId = 1;
export const contributionCorrections: MockContributionCorrection[] = [];

/**
 * Proposal §6/§17: an admin can correct a failed or wrong contribution entry.
 * The mock model only tracks a batch-level total (no per-member line items),
 * so a correction adjusts that total and logs a reasoned entry for the
 * affected member rather than rewriting an individual posting record.
 */
export function correctContribution(
  batchId: number,
  memberId: number,
  amount: number,
  reason: string,
  correctedBy: string,
): MockContributionBatch | undefined {
  const batch = contributionBatches.find((b) => b.id === batchId);
  if (!batch) return undefined;
  const previousTotal = batch.total_amount;
  batch.total_amount = (Number(batch.total_amount) + amount).toFixed(2);
  contributionCorrections.unshift({
    id: nextCorrectionId++,
    batch_id: batchId,
    member_id: memberId,
    amount: amount.toFixed(2),
    reason,
    corrected_by: correctedBy,
    corrected_at: new Date().toISOString(),
  });
  logAuditEntry({
    actorName: correctedBy,
    actorRole: "Full admin",
    action: "CONTRIBUTION_CORRECTED",
    targetMemberId: memberId,
    previousValue: { batch_total: previousTotal },
    newValue: { batch_total: batch.total_amount, adjustment: amount.toFixed(2) },
    reason,
  });
  return batch;
}

export function correctionsForBatch(batchId: number): MockContributionCorrection[] {
  return contributionCorrections.filter((c) => c.batch_id === batchId);
}
