import { getUtilizationColor } from '@/utils/budgetPace';
import { cn } from '@/lib/utils';

export default function BudgetProgressBar({
  spent = 0,
  limit = 0,
  daysLeft,
  periodElapsedPct,
  showLabel = true,
  className,
}) {
  const utilization = limit > 0 ? (spent / limit) * 100 : 0;
  const pct = Math.min(utilization, 100);
  const color = getUtilizationColor(utilization);
  const elapsed = periodElapsedPct ?? null;

  return (
    <div className={cn('space-y-1.5', className)}>
      {showLabel && (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted">
          <span>
            <span className="font-medium text-foreground">{Math.round(utilization)}% spent</span>
            {daysLeft != null && (
              <span> · {daysLeft} day{daysLeft === 1 ? '' : 's'} left</span>
            )}
            {elapsed != null && (
              <span> · {Math.round(elapsed)}% of month</span>
            )}
          </span>
          <span style={{ color }}>
            {utilization >= 100 ? 'Over budget' : utilization >= 80 ? 'Near limit' : 'On track'}
          </span>
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        {elapsed != null && elapsed > 0 && elapsed < 100 && (
          <div
            className="absolute top-0 h-full w-px bg-foreground/40"
            style={{ left: `${Math.min(elapsed, 100)}%` }}
            title={`${Math.round(elapsed)}% of period elapsed`}
          />
        )}
      </div>
    </div>
  );
}
