import { getUtilizationColor } from '@/utils/budgetPace';
import { cn } from '@/lib/utils';

export default function BudgetProgressBar({ spent = 0, limit = 0, showLabel = true, className }) {
  const utilization = limit > 0 ? (spent / limit) * 100 : 0;
  const pct = Math.min(utilization, 100);
  const color = getUtilizationColor(utilization);

  return (
    <div className={cn('space-y-1.5', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted">
          <span>{Math.round(utilization)}% used</span>
          <span style={{ color }}>{utilization >= 100 ? 'Over budget' : utilization >= 80 ? 'Near limit' : 'On track'}</span>
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
