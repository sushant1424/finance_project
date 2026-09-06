import DashboardGreeting from '@/features/dashboard/DashboardGreeting';
import DashboardStats from '@/features/dashboard/DashboardStats';
import BudgetSummaryWidget from '@/features/dashboard/BudgetSummaryWidget';
import GoalsNudge from '@/features/dashboard/GoalsNudge';
import AccountBalances from '@/features/dashboard/AccountBalances';
import CategoryBreakdown from '@/features/dashboard/CategoryBreakdown';
import DashboardCharts from '@/features/dashboard/DashboardCharts';
import RecentTransactions from '@/features/dashboard/RecentTransactions';
import SpendingClusters from '@/features/statistics/SpendingClusters';
import AddTransactionDialog from '@/features/transactions/AddTransactionDialog';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function DashboardPage() {
  const { fetchDashboard } = useAnalytics(true);

  return (
    <div className="relative space-y-5">
      <DashboardGreeting />
      <DashboardStats />

      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        <BudgetSummaryWidget />
        <GoalsNudge />
        <AccountBalances />
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <CategoryBreakdown />
        <SpendingClusters compact />
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <DashboardCharts />
        <RecentTransactions />
      </div>

      <div className="sm:hidden">
        <AddTransactionDialog floating onSuccess={() => fetchDashboard()} />
      </div>
    </div>
  );
}
