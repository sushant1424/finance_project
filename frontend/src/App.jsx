import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import AppLayout from "@/components/layout/AppLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AuthLoading from "@/components/common/AuthLoading";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import TransactionsPage from "@/pages/TransactionsPage";
import BudgetsPage from "@/pages/BudgetsPage";
import GoalsPage from "@/pages/GoalsPage";
import StatisticsPage, {
  StatisticsOverviewRoute,
  StatisticsSpendingRoute,
  StatisticsSavingsRoute,
} from "@/pages/StatisticsPage";
import BillsPage from "@/pages/BillsPage";
import AccountsPage from "@/pages/AccountsPage";
import AccountDetailPage from "@/pages/AccountDetailPage";
import CategoriesPage from "@/pages/CategoriesPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";

function AuthInit() {
  useAuth();
  return null;
}

function AuthRedirect({ children }) {
  const { isAuthenticated, initialized, loading, token } = useAuth();
  if (!initialized || (token && loading && !isAuthenticated))
    return <AuthLoading />;
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInit />
      <Routes>
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route
            path={ROUTES.LOGIN}
            element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <AuthRedirect>
                <RegisterPage />
              </AuthRedirect>
            }
          />
          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={
              <AuthRedirect>
                <ForgotPasswordPage />
              </AuthRedirect>
            }
          />
          <Route
            path={ROUTES.RESET_PASSWORD}
            element={
              <AuthRedirect>
                <ResetPasswordPage />
              </AuthRedirect>
            }
          />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
          <Route path={ROUTES.BUDGETS} element={<BudgetsPage />} />
          <Route path={ROUTES.GOALS} element={<GoalsPage />} />
          <Route path={ROUTES.BILLS} element={<BillsPage />} />
          <Route path={ROUTES.STATISTICS} element={<StatisticsPage />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<StatisticsOverviewRoute />} />
            <Route path="spending" element={<StatisticsSpendingRoute />} />
            <Route path="savings" element={<StatisticsSavingsRoute />} />
            <Route path="bills" element={<Navigate to={ROUTES.BILLS} replace />} />
          </Route>
          <Route path={ROUTES.ACCOUNTS} element={<AccountsPage />} />
          <Route path={ROUTES.ACCOUNT_DETAIL} element={<AccountDetailPage />} />
          <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          {/* Legacy redirects */}
          <Route path={ROUTES.INSIGHTS} element={<Navigate to={ROUTES.STATISTICS_OVERVIEW} replace />} />
          <Route path={ROUTES.REPORTS} element={<Navigate to={ROUTES.STATISTICS_OVERVIEW} replace />} />
          <Route path={ROUTES.ANOMALIES} element={<Navigate to={ROUTES.STATISTICS_OVERVIEW} replace />} />
          <Route path={ROUTES.NET_WORTH} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.RECURRING} element={<Navigate to={ROUTES.BILLS} replace />} />
          <Route path={ROUTES.PROFILE} element={<Navigate to={ROUTES.SETTINGS} replace />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
