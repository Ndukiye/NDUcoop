import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth/LoginPage";
import { RequireAuth } from "./app/RequireAuth";
import { AppShell } from "./app/AppShell";
import { RootDashboard } from "./app/RootDashboard";
import { MembersListPage } from "./features/members-admin/MembersListPage";
import { MemberDetailPage } from "./features/members-admin/MemberDetailPage";
import { DepositsPage } from "./features/deposits/DepositsPage";
import { WithdrawalsPage } from "./features/withdrawals/WithdrawalsPage";
import { AuditLogPage } from "./features/audit/AuditLogPage";
import { ContributionsPage } from "./features/contributions/ContributionsPage";
import { CommoditiesPage } from "./features/commodities/CommoditiesPage";
import { LoansPage } from "./features/loans/LoansPage";
import { LoanApplyWizard } from "./features/loans/LoanApplyWizard";
import { LoanDetailPage } from "./features/loans/LoanDetailPage";
import { ReportsPage } from "./features/reports/ReportsPage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { SettingsPage } from "./features/settings/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<RootDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/contributions" element={<ContributionsPage />} />
            <Route path="/deposits" element={<DepositsPage />} />
            <Route path="/withdrawals" element={<WithdrawalsPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loans/apply" element={<LoanApplyWizard />} />
            <Route path="/loans/:id" element={<LoanDetailPage />} />
            <Route path="/commodities" element={<CommoditiesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/members" element={<MembersListPage />} />
            <Route path="/members/:id" element={<MemberDetailPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
