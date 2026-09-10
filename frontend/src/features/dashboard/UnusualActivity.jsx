import { Link } from 'react-router-dom';
import DashboardPanel from '@/features/dashboard/DashboardPanel';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useResolveCategory } from '@/hooks/useResolveCategory';
import { ROUTES } from '@/constants/routes';

export default function UnusualActivity() {
  const { dashboard } = useAnalytics(true);
  const resolve = useResolveCategory();
  const unusual = dashboard?.unusual_activity;
  const count = unusual?.count ?? 0;
  const items = unusual?.items ?? [];

  return (
    <DashboardPanel
      title="Unusual activity"
      to={ROUTES.STATISTICS_SPENDING}
      actionLabel="Details →"
      minHeight="min-h-[160px]"
    >
      {count > 0 ? (
        <Link to={ROUTES.STATISTICS_SPENDING} className="block space-y-2 hover:opacity-90">
          <p className="text-sm text-foreground">
            <span className="mr-1" aria-hidden>⚠️</span>
            {count} unusual transaction{count === 1 ? '' : 's'} this month
          </p>
          <ul className="space-y-1.5">
            {items.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 text-xs text-muted">
                <span className="truncate">{resolve(a.category).label}</span>
                <span className="shrink-0 font-medium tabular-nums text-foreground">
                  <CurrencyDisplay amount={a.amount} />
                </span>
              </li>
            ))}
          </ul>
        </Link>
      ) : (
        <p className="text-sm text-muted">
          No unusual expenses this month. We flag amounts that stand out vs your typical spend in a category.
        </p>
      )}
    </DashboardPanel>
  );
}
