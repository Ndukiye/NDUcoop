import { useAuthStore } from "../../store/auth";
import { isMember } from "../../lib/roles";
import { CommodityCatalogPage } from "./CommodityCatalogPage";
import { CommodityAdminPage } from "./CommodityAdminPage";

export function CommoditiesPage() {
  const role = useAuthStore((s) => s.user?.role);
  return isMember(role) ? <CommodityCatalogPage /> : <CommodityAdminPage />;
}
