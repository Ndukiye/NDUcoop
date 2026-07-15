import { useAuthStore } from "../../store/auth";
import { isMember } from "../../lib/roles";
import { ContributionsMemberPage } from "./ContributionsMemberPage";
import { ContributionsAdminPage } from "./ContributionsAdminPage";

export function ContributionsPage() {
  const role = useAuthStore((s) => s.user?.role);
  return isMember(role) ? <ContributionsMemberPage /> : <ContributionsAdminPage />;
}
