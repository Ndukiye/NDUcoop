import { useAuthStore } from "../../store/auth";
import { isMember } from "../../lib/roles";
import { ReportsMemberPage } from "./ReportsMemberPage";
import { ReportsAdminPage } from "./ReportsAdminPage";

export function ReportsPage() {
  const role = useAuthStore((s) => s.user?.role);
  return isMember(role) ? <ReportsMemberPage /> : <ReportsAdminPage />;
}
