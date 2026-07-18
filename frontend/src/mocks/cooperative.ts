import { logAuditEntry } from "./audit";
import { currentActorOffice } from "../lib/actor";

export type CooperativeAccountPurpose = "DEPOSITS" | "LOAN_REPAYMENTS" | "COMMODITY_REPAYMENTS";

export interface MockCooperativeAccount {
  id: number;
  purpose: CooperativeAccountPurpose;
  label: string;
  bank_name: string;
  account_name: string;
  account_number: string;
}

export const cooperativeAccounts: MockCooperativeAccount[] = [
  {
    id: 1,
    purpose: "DEPOSITS",
    label: "Deposits",
    bank_name: "First Bank of Nigeria",
    account_name: "NDU Cooperative Society",
    account_number: "0000000000",
  },
  {
    id: 2,
    purpose: "LOAN_REPAYMENTS",
    label: "Loan repayments",
    bank_name: "GTBank",
    account_name: "NDU Cooperative Society — Loans",
    account_number: "0000000000",
  },
  {
    id: 3,
    purpose: "COMMODITY_REPAYMENTS",
    label: "Commodity repayments",
    bank_name: "Zenith Bank",
    account_name: "NDU Cooperative Society — Commodities",
    account_number: "0000000000",
  },
];

export function findCooperativeAccount(purpose: CooperativeAccountPurpose): MockCooperativeAccount {
  return cooperativeAccounts.find((a) => a.purpose === purpose) ?? cooperativeAccounts[0];
}

export function updateCooperativeAccount(
  id: number,
  updates: Partial<Pick<MockCooperativeAccount, "bank_name" | "account_name" | "account_number">>,
): MockCooperativeAccount | undefined {
  const acct = cooperativeAccounts.find((a) => a.id === id);
  if (!acct) return undefined;
  const previousValue = {
    bank_name: acct.bank_name,
    account_name: acct.account_name,
    account_number: acct.account_number,
  };
  Object.assign(acct, updates);
  logAuditEntry({
    actorName: currentActorOffice(),
    actorRole: "Full admin",
    action: "SYSTEM_SETTING_CHANGED",
    targetMemberId: null,
    previousValue,
    newValue: updates,
    reason: `${acct.label} account details updated`,
  });
  return acct;
}
