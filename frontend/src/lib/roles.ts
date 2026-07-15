export type Role =
  | "PRESIDENT"
  | "TREASURER"
  | "ACCOUNTANT"
  | "FINANCIAL_SECRETARY"
  | "GENERAL_SECRETARY"
  | "MEMBER";

export const FULL_ADMIN_ROLES: Role[] = [
  "PRESIDENT",
  "TREASURER",
  "ACCOUNTANT",
  "FINANCIAL_SECRETARY",
];

export const READ_ONLY_ADMIN_ROLES: Role[] = ["GENERAL_SECRETARY"];

export function isFullAdmin(role?: Role) {
  return !!role && FULL_ADMIN_ROLES.includes(role);
}

export function isReadOnlyAdmin(role?: Role) {
  return !!role && READ_ONLY_ADMIN_ROLES.includes(role);
}

export function isAnyAdmin(role?: Role) {
  return isFullAdmin(role) || isReadOnlyAdmin(role);
}

export function isMember(role?: Role) {
  return role === "MEMBER";
}

export function roleLabel(role?: Role): string {
  switch (role) {
    case "PRESIDENT":
      return "President";
    case "TREASURER":
      return "Treasurer";
    case "ACCOUNTANT":
      return "Accountant";
    case "FINANCIAL_SECRETARY":
      return "Financial Secretary";
    case "GENERAL_SECRETARY":
      return "General Secretary";
    case "MEMBER":
      return "Member";
    default:
      return "";
  }
}
