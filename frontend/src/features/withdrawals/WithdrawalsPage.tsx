import { useAuthStore } from "../../store/auth";
import { isMember } from "../../lib/roles";
import { WithdrawalsMemberPage } from "./WithdrawalsMemberPage";
import { WithdrawalsAdminPage } from "./WithdrawalsAdminPage";

export function WithdrawalsPage() {
  const role = useAuthStore((s) => s.user?.role);
  return isMember(role) ? <WithdrawalsMemberPage /> : <WithdrawalsAdminPage />;
}
