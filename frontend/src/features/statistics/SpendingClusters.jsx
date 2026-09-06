import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import DashboardPanel from '@/features/dashboard/DashboardPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import analyticsApi from '@/api/analyticsApi';

const TIER_STYLES = [
  { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600' },
  { bar: 'bg-blue-500', dot: 'bg-blue-500', text: 'text-blue-600' },
  { bar: 'bg-violet-500', dot: 'bg-violet-500', text: 'text-violet-600' },
];

function ClusterBody({ clusters, hasSpending }) {
  return (
    <>
      {hasSpending && (
        <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-surface-2">
          {clusters.map((c, i) => (
            <div
              key={c.key}
              className={TIER_STYLES[i]?.bar ?? 'bg-primary'}
              style={{ width: `${Math.max(c.percentage, c.count > 0 ? 3 : 0)}%` }}
              title={`${c.label}: ${c.percentage}%`}
            />
          ))}
        </div>
      )}
      <div className="space-y-2.5">
        {hasSpending ? (
          clusters.map((c, i) => {
            const style = TIER_STYLES[i] ?? TIER_STYLES[0];
            return (
              <div key={c.key} className="flex min-w-0 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                  <span className="truncate text-sm text-muted">{c.label}</span>
                </div>
                <span className={`shrink-0 text-base font-semibold tabular-nums ${style.text}`}>
                  <CurrencyDisplay amount={c.total_amount} />
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted">
            <Link to={ROUTES.TRANSACTIONS} className="text-primary hover:underline">Add expenses</Link>
            {' '}to group spending.
          </p>
        )}
      </div>
    </>
  );
}

/** @param {{ compact?: boolean }} props — compact uses shared dashboard panel shell */
export default function SpendingClusters({ compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.spendingClusters()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-36 animate-pulse rounded-xl bg-surface-2" />;
  }

  const clusters = data?.clusters ?? [];
  const hasSpending = (data?.total_spent ?? 0) > 0;
  const body = <ClusterBody clusters={clusters} hasSpending={hasSpending} />;

  if (compact) {
    return <DashboardPanel title="Spending groups" minHeight="min-h-[160px]">{body}</DashboardPanel>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Spending groups</CardTitle>
        <p className="text-xs text-muted">Daily spend, monthly bills, big purchases</p>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
