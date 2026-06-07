import DashboardGreeting from '@/features/dashboard/DashboardGreeting';
import MonthOverview from '@/features/dashboard/MonthOverview';
import DashboardStats from '@/features/dashboard/DashboardStats';
import DashboardCharts from '@/features/dashboard/DashboardCharts';
import BudgetSummaryWidget from '@/features/dashboard/BudgetSummaryWidget';
import RecentTransactions from '@/features/dashboard/RecentTransactions';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardGreeting />
      <MonthOverview />
      <DashboardStats />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><DashboardCharts /></div>
        <BudgetSummaryWidget />
      </div>
      <RecentTransactions />
    </div>
  );
}
