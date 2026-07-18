import type { MemberStatus } from "../lib/types";
import { currentActorOffice } from "../lib/actor";
import { logAuditEntry } from "./audit";

export interface MockMember {
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
  status: MemberStatus;
  shares_balance: string;
  welfare_balance: string;
  compulsory_savings_balance: string;
  deposit_balance: string;
  date_joined: string;
}

export function totalAsset(m: MockMember): string {
  return (
    Number(m.shares_balance) +
    Number(m.compulsory_savings_balance) +
    Number(m.deposit_balance)
  ).toFixed(2);
}

const departments = [
  "Finance",
  "Engineering",
  "Human Resources",
  "Operations",
  "Procurement",
  "ICT",
  "Legal",
  "Marketing",
];

const banks = [
  "First Bank of Nigeria",
  "Guaranty Trust Bank (GTBank)",
  "Zenith Bank",
  "United Bank for Africa (UBA)",
  "Access Bank",
];

interface Seed {
  first: string;
  last: string;
  months: number;
  deposit: number;
  status: MemberStatus;
}

const seeds: Seed[] = [
  { first: "Ebiere", last: "Owei", months: 18, deposit: 145000, status: "ACTIVE" },
  { first: "Preye", last: "Ekiyor", months: 30, deposit: 320000, status: "ACTIVE" },
  { first: "Tonbra", last: "Seiyefa", months: 24, deposit: 210500, status: "ACTIVE" },
  { first: "Ibinabo", last: "George", months: 12, deposit: 88000, status: "ACTIVE" },
  { first: "Tamuno", last: "Amachree", months: 20, deposit: 156300, status: "ACTIVE" },
  { first: "Boma", last: "Warmate", months: 9, deposit: 61000, status: "ACTIVE" },
  { first: "Sotonye", last: "Fubara", months: 15, deposit: 102750, status: "ACTIVE" },
  { first: "Dienye", last: "Harry", months: 27, deposit: 275400, status: "ACTIVE" },
  { first: "Tari", last: "Abadi", months: 6, deposit: 32000, status: "ACTIVE" },
  { first: "Timipre", last: "Igali", months: 33, deposit: 401200, status: "ACTIVE" },
  { first: "Dagogo", last: "Jack", months: 11, deposit: 74800, status: "ACTIVE" },
  { first: "Ayebaemi", last: "Spiff", months: 22, deposit: 189000, status: "ACTIVE" },
  { first: "Ebipade", last: "Clark", months: 17, deposit: 121300, status: "ACTIVE" },
  { first: "Oyinkuro", last: "Sasime", months: 14, deposit: 98600, status: "ACTIVE" },
  { first: "Perekeme", last: "Ndiomu", months: 26, deposit: 245000, status: "ACTIVE" },
  { first: "Ekiye", last: "Alabo", months: 8, deposit: 45500, status: "ACTIVE" },
  { first: "Tubotamuno", last: "Pepple", months: 19, deposit: 137700, status: "ACTIVE" },
  { first: "Diseye", last: "Poweide", months: 31, deposit: 356900, status: "ACTIVE" },
  { first: "Ayibanua", last: "Kemefa", months: 13, deposit: 91200, status: "ACTIVE" },
  { first: "Ebikake", last: "Etolor", months: 25, deposit: 224000, status: "ACTIVE" },
  { first: "Kemepade", last: "Diri", months: 4, deposit: 18000, status: "INACTIVE" },
  { first: "Tekena", last: "West", months: 36, deposit: 512000, status: "RETIRED" },
  { first: "Ibiere", last: "Banigo", months: 28, deposit: 298000, status: "RETIRED" },
  { first: "Opuada", last: "Alale", months: 10, deposit: 51000, status: "SUSPENDED" },
  { first: "Erebi", last: "Timiyan", months: 5, deposit: 22500, status: "INACTIVE" },
  { first: "Seiyefa", last: "Brisibe", months: 16, deposit: 108900, status: "TERMINATED" },
  { first: "Nengi", last: "Allison", months: 21, deposit: 168400, status: "ACTIVE" },
  { first: "Tamara", last: "Ikoli", months: 7, deposit: 38700, status: "ACTIVE" },
];

let nextId = 1;

export const members: MockMember[] = seeds.map((s, i) => {
  const shares = s.months * 7000;
  const compulsory = s.months * 3000;
  const id = nextId++;
  return {
    id,
    membership_id: `NDU-${String(id).padStart(4, "0")}`,
    first_name: s.first,
    last_name: s.last,
    email: `${s.first.toLowerCase()}.${s.last.toLowerCase()}@ndu-coop.example`,
    staff_number: `STAFF-${1000 + id}`,
    department_unit: departments[i % departments.length],
    phone: `080${String(10000000 + id * 137).slice(0, 8)}`,
    bank_name: banks[i % banks.length],
    bank_account_name: `${s.first} ${s.last}`,
    bank_account_number: "1111111111",
    status: s.status,
    shares_balance: shares.toFixed(2),
    welfare_balance: (s.months * 200).toFixed(2),
    compulsory_savings_balance: compulsory.toFixed(2),
    deposit_balance: s.deposit.toFixed(2),
    date_joined: new Date(2023, i % 12, ((i * 3) % 27) + 1).toISOString(),
  };
});

export function findMember(id: number): MockMember | undefined {
  return members.find((m) => m.id === id);
}

export function findMemberByMembershipId(membershipId: string): MockMember | undefined {
  const q = membershipId.trim().toLowerCase();
  if (!q) return undefined;
  return members.find((m) => m.membership_id.toLowerCase() === q);
}

export function updateMemberStatus(
  id: number,
  status: MemberStatus,
  reason: string,
  actorName: string,
): MockMember | undefined {
  const member = findMember(id);
  if (!member) return undefined;
  const previousStatus = member.status;
  member.status = status;
  logAuditEntry({
    actorName,
    actorRole: "Full admin",
    action: "MEMBER_STATUS_CHANGED",
    targetMemberId: member.id,
    previousValue: { status: previousStatus },
    newValue: { status },
    reason,
  });
  return member;
}

export function updateMemberDetails(
  id: number,
  updates: { phone: string; department_unit: string; staff_number: string },
  actorName: string,
): MockMember | undefined {
  const member = findMember(id);
  if (!member) return undefined;
  const previousValue = {
    phone: member.phone,
    department_unit: member.department_unit,
    staff_number: member.staff_number,
  };
  Object.assign(member, updates);
  logAuditEntry({
    actorName,
    actorRole: "Full admin",
    action: "MEMBER_EDITED",
    targetMemberId: member.id,
    previousValue,
    newValue: updates,
    reason: "Member record updated",
  });
  return member;
}

export function updateMemberBankDetails(
  id: number,
  bankName: string,
  bankAccountName: string,
  bankAccountNumber: string,
): MockMember | undefined {
  const member = findMember(id);
  if (!member) return undefined;
  const previousValue = {
    bank_name: member.bank_name,
    bank_account_name: member.bank_account_name,
    bank_account_number: member.bank_account_number,
  };
  member.bank_name = bankName;
  member.bank_account_name = bankAccountName;
  member.bank_account_number = bankAccountNumber;
  logAuditEntry({
    actorName: `${member.first_name} ${member.last_name}`,
    actorRole: "Member",
    action: "BANK_DETAILS_UPDATED",
    targetMemberId: member.id,
    previousValue,
    newValue: {
      bank_name: bankName,
      bank_account_name: bankAccountName,
      bank_account_number: bankAccountNumber,
    },
    reason: "Member-initiated update",
  });
  return member;
}

/**
 * Proposal §25: when a member terminates membership and has been fully paid
 * out, an admin clears the member's total asset in the month of payment. The
 * member stays on record, tagged TERMINATED, with balances zeroed.
 */
export function terminateMember(
  id: number,
  reason: string,
  actorName: string,
): MockMember | undefined {
  const member = findMember(id);
  if (!member) return undefined;
  const previousValue = {
    status: member.status,
    shares_balance: member.shares_balance,
    welfare_balance: member.welfare_balance,
    compulsory_savings_balance: member.compulsory_savings_balance,
    deposit_balance: member.deposit_balance,
  };
  member.status = "TERMINATED";
  member.shares_balance = "0.00";
  member.welfare_balance = "0.00";
  member.compulsory_savings_balance = "0.00";
  member.deposit_balance = "0.00";
  logAuditEntry({
    actorName,
    actorRole: "Full admin",
    action: "MEMBER_ASSET_CLEARED",
    targetMemberId: member.id,
    previousValue,
    newValue: { status: "TERMINATED", total_asset: "0.00" },
    reason,
  });
  return member;
}

export function addMember(input: {
  first_name: string;
  last_name: string;
  email: string;
  staff_number: string;
  department_unit: string;
  phone: string;
}): MockMember {
  const id = nextId++;
  const member: MockMember = {
    id,
    membership_id: `NDU-${String(id).padStart(4, "0")}`,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    staff_number: input.staff_number,
    department_unit: input.department_unit,
    phone: input.phone,
    bank_name: "",
    bank_account_name: "",
    bank_account_number: "",
    status: "ACTIVE",
    shares_balance: "0.00",
    welfare_balance: "0.00",
    compulsory_savings_balance: "0.00",
    deposit_balance: "0.00",
    date_joined: new Date().toISOString(),
  };
  members.unshift(member);
  logAuditEntry({
    actorName: currentActorOffice(),
    actorRole: "Full admin",
    action: "MEMBER_ONBOARDED",
    targetMemberId: member.id,
    previousValue: null,
    newValue: { membership_id: member.membership_id, department_unit: member.department_unit },
    reason: "",
  });
  return member;
}
