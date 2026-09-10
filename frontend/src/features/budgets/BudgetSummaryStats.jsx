import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/common/StatCard';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import SkeletonCard from '@/components/common/SkeletonCard';
import BudgetProgressBar from '@/components/budget/BudgetProgressBar';
import { useBudgets } from '@/hooks/useBudgets';
import { Wallet, TrendingDown, CheckCircle, AlertTriangle, Minus } from 'lucide-react';

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

  const total = summary.budgets?.length ?? 0;
  const noBudgets = total === 0;
  const onTrackIcon = noBudgets
    ? Minus
    : summary.over_budget_count > 0
      ? AlertTriangle
      : CheckCircle;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overall this month</CardTitle>
          <p className="text-xs text-muted">
            Total spent vs total budgeted
            {summary.days_left != null && ` · ${summary.days_left} days left`}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-2xl font-semibold tabular-nums">
            <CurrencyDisplay amount={summary.total_spent} />
            <span className="text-base font-normal text-muted">
              {' '}/ <CurrencyDisplay amount={summary.total_budgeted} />
            </span>
          </p>
          <BudgetProgressBar
            spent={summary.total_spent}
            limit={summary.total_budgeted}
            daysLeft={summary.days_left}
            periodElapsedPct={summary.period_elapsed_pct}
          />
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total budgeted" value={<CurrencyDisplay amount={summary.total_budgeted} />} icon={Wallet} />
        <StatCard title="Total spent" value={<CurrencyDisplay amount={summary.total_spent} />} icon={TrendingDown} />
        <StatCard title="Remaining" value={<CurrencyDisplay amount={summary.remaining} />} icon={Wallet} />
        <StatCard
          title="On track"
          value={noBudgets ? '—' : `${summary.on_track_count ?? 0} / ${total}`}
          icon={onTrackIcon}
          valueClassName={noBudgets ? 'text-muted' : undefined}
          iconClassName={noBudgets ? 'text-muted' : undefined}
        />
      </div>
    </div>
  );
}
