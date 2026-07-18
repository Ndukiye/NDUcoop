import { delay } from "../../mocks/delay";
import { currentActorOffice } from "../../lib/actor";
import {
  contributionBatches,
  postContributionBatch,
  correctContribution,
  correctionsForBatch,
  prepareMonthlyPosting,
  currentPostingMonth,
  type MockContributionBatch,
  type MockPostingRow,
} from "../../mocks/contributions";
import { findMember } from "../../mocks/members";
import { getMemberLedger } from "../../mocks/ledger";
import { lookupMemberByMembershipId } from "../shared/memberLookup";

export { lookupMemberByMembershipId };

export async function fetchContributionBatches(): Promise<MockContributionBatch[]> {
  return delay(contributionBatches);
}

export interface EnrichedContributionCorrection {
  id: number;
  member_name: string;
  amount: string;
  reason: string;
  corrected_by: string;
  corrected_at: string;
}

export async function fetchCorrectionsForBatch(
  batchId: number,
): Promise<EnrichedContributionCorrection[]> {
  const rows = correctionsForBatch(batchId).map((c) => {
    const m = findMember(c.member_id);
    return {
      id: c.id,
      member_name: m ? `${m.first_name} ${m.last_name}` : "Unknown member",
      amount: c.amount,
      reason: c.reason,
      corrected_by: c.corrected_by,
      corrected_at: c.corrected_at,
    };
  });
  return delay(rows);
}

export async function submitContributionCorrection(input: {
  batchId: number;
  memberId: number;
  amount: number;
  reason: string;
}): Promise<MockContributionBatch | null> {
  const batch = correctContribution(
    input.batchId,
    input.memberId,
    input.amount,
    input.reason,
    currentActorOffice(),
  );
  return delay(batch ?? null, 300);
}

export { currentPostingMonth };

export async function fetchPostingPreparation(): Promise<MockPostingRow[]> {
  return delay(prepareMonthlyPosting(), 300);
}

export async function postContributions(
  rows: { memberId: number; amount: string }[],
): Promise<MockContributionBatch> {
  return delay(postContributionBatch(rows), 250);
}

export interface ContributionMonthRow {
  month: string;
  shares: string;
  welfare: string;
  compulsory: string;
  deposit: string;
  total: string;
}

export async function fetchMyContributions(memberId: number): Promise<ContributionMonthRow[]> {
  const ledger = getMemberLedger(memberId);
  const byMonth = new Map<string, ContributionMonthRow>();

  for (const entry of ledger) {
    const key = new Date(entry.created_at).toLocaleDateString("en-NG", {
      month: "long",
      year: "numeric",
    });
    if (!byMonth.has(key)) {
      byMonth.set(key, {
        month: key,
        shares: "0",
        welfare: "0",
        compulsory: "0",
        deposit: "0",
        total: "0",
      });
    }
    const row = byMonth.get(key)!;
    const amt = Number(entry.amount).toFixed(2);
    if (entry.category === "SHARES") row.shares = amt;
    if (entry.category === "WELFARE") row.welfare = amt;
    if (entry.category === "COMPULSORY_SAVINGS") row.compulsory = amt;
    if (entry.category === "DEPOSIT") row.deposit = amt;
  }

  const rows = Array.from(byMonth.values()).map((r) => ({
    ...r,
    total: (
      Number(r.shares) +
      Number(r.welfare) +
      Number(r.compulsory) +
      Number(r.deposit)
    ).toFixed(2),
  }));

  return delay(rows);
}
