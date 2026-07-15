import { useAuthStore } from "../store/auth";
import { isMember } from "../lib/roles";
import { MemberDashboardPage } from "../features/dashboard-member/DashboardPage";
import { AdminDashboardPage } from "../features/dashboard-admin/DashboardPage";

export function RootDashboard() {
  const user = useAuthStore((s) => s.user);
  return isMember(user?.role) ? <MemberDashboardPage /> : <AdminDashboardPage />;
}
