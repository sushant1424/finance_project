import { Link } from 'react-router-dom';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import DashboardPanel from '@/features/dashboard/DashboardPanel';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useResolveCategory } from '@/hooks/useResolveCategory';
import { ROUTES } from '@/constants/routes';

export default function CategoryBreakdown() {
  const { dashboard } = useAnalytics(true);
  const resolve = useResolveCategory();
  const top = (dashboard?.top_categories ?? []).slice(0, 3);

  return (
    <DashboardPanel title="Top spending" to={ROUTES.STATISTICS_SPENDING} actionLabel="Breakdown →" minHeight="min-h-[160px]">
      {top.length === 0 ? (
        <p className="text-sm text-muted">
          <Link to={ROUTES.TRANSACTIONS} className="text-primary hover:underline">Add expenses</Link>
          {' '}to see categories.
        </p>
      ) : (
        <ul className="space-y-3">
          {top.map((item) => {
            const meta = resolve(item.category);
            return (
              <li key={item.category} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-sm text-muted">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="truncate">{meta.label}</span>
                </span>
                <CurrencyDisplay amount={item.amount} className="text-base font-semibold tabular-nums" />
              </li>
            );
          })}
        </ul>
      )}
    </DashboardPanel>
  );
}
