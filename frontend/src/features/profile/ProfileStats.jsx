import StatCard from '@/components/common/StatCard';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { Wallet, Receipt, Target, AlertTriangle, PiggyBank } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileStats() {
  const { dashboard, loading } = useAnalytics(true);
  const { currency, showCents } = useAuth();
  const d = dashboard ?? {};

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard title="Transactions logged" icon={Receipt} value={d.total_transactions ?? 0} />
      <StatCard title="Total income tracked" icon={Wallet}
        value={<CurrencyDisplay amount={d.total_income_all} currency={currency} showCents={showCents} />} />
      <StatCard title="Total expenses tracked" icon={PiggyBank}
        value={<CurrencyDisplay amount={d.total_expenses_all} currency={currency} showCents={showCents} />} />
      <StatCard title="Anomalies detected" icon={AlertTriangle} value={d.total_anomalies ?? 0} />
      <StatCard title="Goals created" icon={Target} value={d.goals_count ?? 0} />
      <StatCard title="Budgets active" icon={Wallet} value={d.budgets_count ?? 0} />
    </div>
  );
}
