import { delay } from "../../mocks/delay";
import { findMember, totalAsset } from "../../mocks/members";

export const CURRENT_MEMBER_ID = 1;

export interface MemberProfile {
  id: number;
  membership_id: string;
  email: string;
  first_name: string;
  last_name: string;
  staff_number: string;
  department_unit: string;
  phone: string;
  bank_name: string;
  bank_account_number: string;
  status: string;
  shares_balance: string;
  welfare_balance: string;
  compulsory_savings_balance: string;
  deposit_balance: string;
  total_asset: string;
}

export async function fetchMyProfile(): Promise<MemberProfile> {
  const m = findMember(CURRENT_MEMBER_ID)!;
  const profile: MemberProfile = {
    id: m.id,
    membership_id: m.membership_id,
    email: m.email,
    first_name: m.first_name,
    last_name: m.last_name,
    staff_number: m.staff_number,
    department_unit: m.department_unit,
    phone: m.phone,
    bank_name: m.bank_name,
    bank_account_number: m.bank_account_number,
    status: m.status,
    shares_balance: m.shares_balance,
    welfare_balance: m.welfare_balance,
    compulsory_savings_balance: m.compulsory_savings_balance,
    deposit_balance: m.deposit_balance,
    total_asset: totalAsset(m),
  };
  return delay(profile);
}
