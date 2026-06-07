import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import AppLayout from '@/components/layout/AppLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AuthLoading from '@/components/common/AuthLoading';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import NotificationsPage from '@/pages/NotificationsPage';
import TransactionsPage from '@/pages/TransactionsPage';
import BudgetsPage from '@/pages/BudgetsPage';
import GoalsPage from '@/pages/GoalsPage';
import InsightsPage from '@/pages/InsightsPage';
import ReportsPage from '@/pages/ReportsPage';
import AnomaliesPage from '@/pages/AnomaliesPage';
import NetWorthPage from '@/pages/NetWorthPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';

function AuthInit() {
  useAuth();
  return null;
}

function AuthRedirect({ children }) {
  const { isAuthenticated, initialized, loading, token } = useAuth();

  if (!initialized || (token && loading && !isAuthenticated)) {
    return <AuthLoading />;
  }
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
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
          <Route path={ROUTES.BUDGETS} element={<BudgetsPage />} />
          <Route path={ROUTES.GOALS} element={<GoalsPage />} />
          <Route path={ROUTES.INSIGHTS} element={<InsightsPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.ANOMALIES} element={<AnomaliesPage />} />
          <Route path={ROUTES.NET_WORTH} element={<NetWorthPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
