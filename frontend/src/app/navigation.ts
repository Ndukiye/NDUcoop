import type { Role } from "../lib/roles";
import { isFullAdmin, isAnyAdmin } from "../lib/roles";

export interface NavItem {
  label: string;
  to: string;
  icon:
    | "home"
    | "wallet"
    | "arrow-down"
    | "arrow-up"
    | "handshake"
    | "sack"
    | "file"
    | "log"
    | "users"
    | "settings";
  show: (role?: Role) => boolean;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: "home", show: () => true },
  { label: "Contributions", to: "/contributions", icon: "wallet", show: () => true },
  { label: "Deposits", to: "/deposits", icon: "arrow-down", show: () => true },
  { label: "Withdrawals", to: "/withdrawals", icon: "arrow-up", show: () => true },
  { label: "Loans", to: "/loans", icon: "handshake", show: () => true },
  { label: "Commodities", to: "/commodities", icon: "sack", show: () => true },
  { label: "Reports", to: "/reports", icon: "file", show: () => true },
  { label: "Members", to: "/members", icon: "users", show: (role) => isAnyAdmin(role) },
  { label: "Audit Log", to: "/audit", icon: "log", show: (role) => isAnyAdmin(role) },
  { label: "Settings", to: "/settings", icon: "settings", show: (role) => isFullAdmin(role) },
];

export function visibleNavItems(role?: Role) {
  return navItems.filter((item) => item.show(role));
}

export { isFullAdmin };
