import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

function pctChange(current, previous) {
  if (previous == null || previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function StatBox({ label, amount, change, badWhenUp, icon: Icon, iconClass, to, subtitle }) {
  const up = change != null && change > 0;
  const down = change != null && change < 0;
  const Arrow = up ? ArrowUp : ArrowDown;
  const good = change == null ? null : badWhenUp ? down || change === 0 : up || change === 0;

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted">{label}</p>
        <Icon className={cn('h-4 w-4', iconClass)} />
      </div>
      <p className={cn('mt-3 text-2xl font-semibold tabular-nums tracking-tight', amount < 0 && 'text-danger')}>
        <CurrencyDisplay amount={amount} />
      </p>
      {subtitle && <p className="mt-1.5 text-xs text-muted">{subtitle}</p>}
      {change != null && (
        <p
          className={cn(
            'mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium',
            good ? 'text-success' : 'text-danger',
          )}
        >
          {change !== 0 && <Arrow className="h-3 w-3" />}
          {Math.abs(change)}% vs last month
        </p>
      )}
    </>
  );

  const className =
    'flex h-full flex-col rounded-xl border border-border bg-surface-1 p-5 transition-colors hover:border-primary/30';

  if (to) return <Link to={to} className={className}>{body}</Link>;
  return <div className={className}>{body}</div>;
}

export default function DashboardStats() {
  const { dashboard, loading } = useAnalytics(true);

  if (loading && !dashboard) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-2" />
        ))}
      </div>
    );
  }

  const d = dashboard ?? {};

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatBox
        label="Net worth"
        amount={d.net_worth ?? 0}
        icon={Wallet}
        iconClass="text-primary"
        to={ROUTES.ACCOUNTS}
        subtitle="All accounts · debts subtracted"
      />
      <StatBox
        label="Income"
        amount={d.total_income}
        change={pctChange(d.total_income, d.prev_income)}
        icon={TrendingUp}
        iconClass="text-success"
      />
      <StatBox
        label="Expenses"
        amount={d.total_expenses}
        change={pctChange(d.total_expenses, d.prev_expenses)}
        badWhenUp
        icon={TrendingDown}
        iconClass="text-danger"
      />
    </div>
  );
}
