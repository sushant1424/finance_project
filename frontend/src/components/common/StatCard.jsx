import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import TrendBadge from '@/components/common/TrendBadge';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  trendLabel,
  valueClassName,
  iconClassName,
  className,
  children,
  to,
}) {
  const showTrend = trend && trendValue !== undefined && Number.isFinite(trendValue);

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className={cn('mt-2 text-2xl font-semibold tabular-nums text-foreground', valueClassName)}>
            {value}
          </p>
          {showTrend && (
            <div className="mt-2 flex items-center gap-2">
              <TrendBadge direction={trend} value={trendValue} />
              {trendLabel && <span className="text-[11px] text-muted">{trendLabel}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-primary',
              iconClassName,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </>
  );

  const cardClass = cn(
    'rounded-xl border border-border bg-surface-1 p-5 shadow-sm',
    to && 'transition-colors hover:border-primary/30',
    className,
  );

  if (to) {
    return <Link to={to} className={cardClass}>{content}</Link>;
  }

  return <div className={cardClass}>{content}</div>;
}
