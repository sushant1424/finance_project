import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import analyticsApi from '@/api/analyticsApi';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import DashboardPanel from '@/features/dashboard/DashboardPanel';
import { useCategories } from '@/hooks/useCategories';
import { ROUTES } from '@/constants/routes';
import { resolveCategory } from '@/utils/resolveCategory';

export default function MonthlyRecap() {
  const [recap, setRecap] = useState(null);
  const { custom } = useCategories();

  useEffect(() => {
    analyticsApi.monthlyRecap().then((data) => {
      if (data?.label) setRecap(data);
    }).catch(() => {});
  }, []);

  if (!recap) return null;

  const top = resolveCategory(recap.top_category, custom);
  const biggest = recap.biggest_expense;
  const biggestCat = biggest ? resolveCategory(biggest.category, custom) : null;

  return (
    <DashboardPanel
      title={`${recap.label} recap`}
      to={ROUTES.STATISTICS_OVERVIEW}
      actionLabel="Full stats →"
      minHeight="min-h-[140px]"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <RecapStat label="Total spent">
          <CurrencyDisplay amount={recap.total_spent} />
        </RecapStat>
        <RecapStat label="Top category">
          {top.label}
          {recap.top_category_amount > 0 && (
            <span className="ml-1 text-muted">
              · <CurrencyDisplay amount={recap.top_category_amount} />
            </span>
          )}
        </RecapStat>
        <RecapStat label="Biggest expense">
          {biggest ? (
            <>
              <span className="truncate">{biggest.description}</span>
              <span className="ml-1 shrink-0 text-muted">
                · <CurrencyDisplay amount={biggest.amount} />
              </span>
            </>
          ) : (
            '—'
          )}
          {biggestCat && (
            <span className="mt-0.5 block text-xs text-muted">{biggestCat.label}</span>
          )}
        </RecapStat>
        <RecapStat label="Savings rate">
          {recap.savings_rate == null ? '—' : `${recap.savings_rate}%`}
        </RecapStat>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <CalendarDays className="h-3 w-3" />
        Snapshot of last month - numbers you already track, gathered in one place.
      </p>
    </DashboardPanel>
  );
}

function RecapStat({ label, children }) {
  return (
    <div className="min-w-0 rounded-lg border border-border/60 bg-surface-2/40 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold tabular-nums text-foreground">{children}</p>
    </div>
  );
}
