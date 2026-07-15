import { useAuthStore } from "../../store/auth";
import { isMember } from "../../lib/roles";
import { DepositsMemberPage } from "./DepositsMemberPage";
import { DepositsAdminPage } from "./DepositsAdminPage";

export function DepositsPage() {
  const role = useAuthStore((s) => s.user?.role);
  return isMember(role) ? <DepositsMemberPage /> : <DepositsAdminPage />;
}
