import { useAuthStore } from "../../store/auth";
import { isMember } from "../../lib/roles";
import { LoanProductsPage } from "./LoanProductsPage";
import { LoanApprovalQueuePage } from "./LoanApprovalQueuePage";

export function LoansPage() {
  const role = useAuthStore((s) => s.user?.role);
  return isMember(role) ? <LoanProductsPage /> : <LoanApprovalQueuePage />;
}
