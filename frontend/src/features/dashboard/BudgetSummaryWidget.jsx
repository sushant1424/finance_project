import { Link } from 'react-router-dom';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import BudgetProgressBar from '@/components/budget/BudgetProgressBar';
import DashboardPanel from '@/features/dashboard/DashboardPanel';
import { useBudgets } from '@/hooks/useBudgets';
import { ROUTES } from '@/constants/routes';

export default function BudgetSummaryWidget() {
  const { summary, loading } = useBudgets();

  if (loading && !summary) {
    return <div className="h-36 animate-pulse rounded-xl bg-surface-2" />;
  }

  const spent = summary?.total_spent ?? 0;
  const limit = summary?.total_budgeted ?? 0;

  return (
    <DashboardPanel title="Budget this month" to={ROUTES.BUDGETS} actionLabel="Details →" minHeight="min-h-[160px]">
      {limit > 0 ? (
        <div className="space-y-3">
          <p className="text-xl font-semibold tabular-nums">
            <CurrencyDisplay amount={spent} />
            <span className="text-sm font-normal text-muted">
              {' '}/ <CurrencyDisplay amount={limit} />
            </span>
          </p>
          <BudgetProgressBar
            spent={spent}
            limit={limit}
            daysLeft={summary?.days_left}
            periodElapsedPct={summary?.period_elapsed_pct}
          />
        </div>
      ) : (
        <p className="text-sm text-muted">
          <Link to={ROUTES.BUDGETS} className="text-primary hover:underline">Set a budget</Link>
          {' '}to track spending pace.
        </p>
      )}
    </DashboardPanel>
  );
}
