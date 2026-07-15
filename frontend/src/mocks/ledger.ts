import type { LedgerCategory } from "../lib/types";
import { findMember } from "./members";

export interface MockLedgerEntry {
  id: string;
  category: LedgerCategory;
  amount: string;
  running_balance_after: string;
  description: string;
  created_at: string;
}

export function getMemberLedger(memberId: number): MockLedgerEntry[] {
  const member = findMember(memberId);
  if (!member) return [];

  const months = Math.round(Number(member.shares_balance) / 7000);
  const entries: MockLedgerEntry[] = [];
  let sharesRunning = 0;
  let compulsoryRunning = 0;
  let welfareRunning = 0;
  let depositRunning = 0;

  const joined = new Date(member.date_joined);
  const monthlyDeposit = months > 0 ? Number(member.deposit_balance) / months : 0;

  for (let i = 0; i < months; i++) {
    const date = new Date(joined.getFullYear(), joined.getMonth() + i, 25);

    sharesRunning += 7000;
    entries.push({
      id: `${memberId}-shares-${i}`,
      category: "SHARES",
      amount: "7000.00",
      running_balance_after: sharesRunning.toFixed(2),
      description: "Monthly contribution — Shares",
      created_at: date.toISOString(),
    });

    compulsoryRunning += 3000;
    entries.push({
      id: `${memberId}-compulsory-${i}`,
      category: "COMPULSORY_SAVINGS",
      amount: "3000.00",
      running_balance_after: compulsoryRunning.toFixed(2),
      description: "Monthly contribution — Compulsory savings",
      created_at: date.toISOString(),
    });

    welfareRunning += 200;
    entries.push({
      id: `${memberId}-welfare-${i}`,
      category: "WELFARE",
      amount: "200.00",
      running_balance_after: welfareRunning.toFixed(2),
      description: "Monthly contribution — Welfare",
      created_at: date.toISOString(),
    });

    if (monthlyDeposit > 0) {
      depositRunning += monthlyDeposit;
      entries.push({
        id: `${memberId}-deposit-${i}`,
        category: "DEPOSIT",
        amount: monthlyDeposit.toFixed(2),
        running_balance_after: depositRunning.toFixed(2),
        description: "Monthly contribution — Deposit",
        created_at: date.toISOString(),
      });
    }
  }

  return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
