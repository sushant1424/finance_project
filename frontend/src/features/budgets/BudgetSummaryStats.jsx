import StatCard from '@/components/common/StatCard';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import SkeletonCard from '@/components/common/SkeletonCard';
import { useBudgets } from '@/hooks/useBudgets';
import { Wallet, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BudgetSummaryStats() {
  const { summary, loading } = useBudgets();

  if (loading && !summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total budgeted" value={<CurrencyDisplay amount={summary.total_budgeted} />} icon={Wallet} />
      <StatCard title="Total spent" value={<CurrencyDisplay amount={summary.total_spent} />} icon={TrendingDown} />
      <StatCard title="Remaining" value={<CurrencyDisplay amount={summary.remaining} />} icon={Wallet} />
      <StatCard title="On track" value={`${summary.on_track_count ?? 0} / ${(summary.on_track_count ?? 0) + (summary.over_budget_count ?? 0)}`} icon={summary.over_budget_count > 0 ? AlertTriangle : CheckCircle} />
    </div>
  );
}
