import { delay } from "../../mocks/delay";
import { findMember, updateMemberBankDetails } from "../../mocks/members";

export const CURRENT_MEMBER_ID = 1;

export interface MyProfile {
  id: number;
  membership_id: string;
  first_name: string;
  last_name: string;
  email: string;
  staff_number: string;
  department_unit: string;
  phone: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  status: string;
  date_joined: string;
}

export async function fetchMyFullProfile(): Promise<MyProfile> {
  const m = findMember(CURRENT_MEMBER_ID)!;
  return delay({ ...m });
}

export async function updateMyBankDetails(input: {
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
}): Promise<MyProfile> {
  const m = updateMemberBankDetails(
    CURRENT_MEMBER_ID,
    input.bank_name,
    input.bank_account_name,
    input.bank_account_number,
  )!;
  return delay({ ...m });
}
