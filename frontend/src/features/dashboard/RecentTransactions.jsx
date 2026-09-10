import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import DashboardPanel from '@/features/dashboard/DashboardPanel';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatDate';
import { useResolveCategory } from '@/hooks/useResolveCategory';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const MAX = 5;

export default function RecentTransactions() {
  const { dashboard } = useAnalytics(true);
  const { currency, showCents, user } = useAuth();
  const resolve = useResolveCategory();
  const navigate = useNavigate();
  const items = (dashboard?.recent_transactions ?? []).slice(0, MAX);

  return (
    <DashboardPanel title="Recent transactions" to={ROUTES.TRANSACTIONS} actionLabel="View all →" minHeight="min-h-[340px]">
      {items.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions yet"
          description="Log something to confirm it shows up here."
          actionLabel="Add transaction"
          onAction={() => navigate(ROUTES.TRANSACTIONS)}
        />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {tx.anomaly && (
                    <span
                      className="mr-1 inline-block"
                      title={tx.anomaly.reason || 'Unusual for this category'}
                      aria-label="Unusual transaction"
                    >
                      ⚠️
                    </span>
                  )}
                  {tx.description}
                </p>
                <p className="text-xs text-muted">
                  {resolve(tx.category).label}
                  {' · '}
                  {formatDate(tx.date, user?.date_format)}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 text-base font-semibold tabular-nums',
                  tx.type === 'income'
                    ? 'text-success'
                    : tx.type === 'transfer'
                      ? 'text-muted'
                      : 'text-danger',
                )}
              >
                <CurrencyDisplay amount={tx.amount} currency={currency} showCents={showCents} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
