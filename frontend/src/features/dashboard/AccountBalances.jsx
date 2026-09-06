import { Link } from 'react-router-dom';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import DashboardPanel from '@/features/dashboard/DashboardPanel';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const LIMIT = 3;

export default function AccountBalances() {
  const { accounts, loading } = useAccounts();
  const { currency, showCents } = useAuth();

  if (loading && !accounts.length) {
    return <div className="h-36 animate-pulse rounded-xl bg-surface-2" />;
  }

  const shown = [...accounts]
    .sort((a, b) => Math.abs(Number(b.balance || 0)) - Math.abs(Number(a.balance || 0)))
    .slice(0, LIMIT);
  const hasMore = accounts.length > LIMIT;

  return (
    <DashboardPanel
      title="Accounts"
      to={ROUTES.ACCOUNTS}
      actionLabel={hasMore ? 'View all →' : 'Manage →'}
      minHeight="min-h-[160px]"
    >
      {shown.length === 0 ? (
        <p className="text-sm text-muted">No accounts yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {shown.map((a) => (
            <li key={a.id}>
              <Link
                to={`${ROUTES.ACCOUNTS}/${a.id}`}
                className="flex items-center justify-between gap-2 hover:opacity-80"
              >
                <span className="truncate text-sm text-muted">{a.name}</span>
                <CurrencyDisplay
                  amount={a.balance}
                  currency={currency}
                  showCents={showCents}
                  className={cn(
                    'text-base font-semibold tabular-nums',
                    a.balance < 0 ? 'text-danger' : 'text-foreground',
                  )}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
