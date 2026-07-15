import { delay } from "../../mocks/delay";
import {
  cooperativeAccounts,
  updateCooperativeAccount,
  type MockCooperativeAccount,
} from "../../mocks/cooperative";

export async function fetchCooperativeAccounts(): Promise<MockCooperativeAccount[]> {
  return delay(cooperativeAccounts);
}

export async function saveCooperativeAccount(
  id: number,
  updates: { bank_name: string; account_name: string; account_number: string },
): Promise<MockCooperativeAccount | null> {
  const acct = updateCooperativeAccount(id, updates);
  return delay(acct ?? null);
}
