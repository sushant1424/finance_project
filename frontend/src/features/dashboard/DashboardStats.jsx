import { DollarSign, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import SkeletonCard from '@/components/common/SkeletonCard';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export default function DashboardStats() {
  const { dashboard, loading } = useAnalytics(true);
  const { currency, showCents } = useAuth();

  if (loading && !dashboard) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const d = dashboard ?? {};
  const fmt = (v) => <CurrencyDisplay amount={v} currency={currency} showCents={showCents} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Net Balance" value={fmt(d.net_balance)} icon={DollarSign}
        trend={d.balance_change_pct >= 0 ? 'up' : 'down'} trendValue={`${Math.abs(d.balance_change_pct ?? 0)}%`}
        to={ROUTES.REPORTS} />
      <StatCard title="Income" value={fmt(d.total_income)} icon={TrendingUp} to={ROUTES.TRANSACTIONS} />
      <StatCard title="Expenses" value={fmt(d.total_expenses)} icon={TrendingDown} to={ROUTES.TRANSACTIONS} />
      <StatCard title="Anomalies" value={d.active_anomalies ?? 0} icon={AlertTriangle}
        valueClassName="text-warning" to={ROUTES.ANOMALIES} />
    </div>
  );
}
