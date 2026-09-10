import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import analyticsApi from '@/api/analyticsApi';
import transactionApi from '@/api/transactionApi';
import { useResolveCategory } from '@/hooks/useResolveCategory';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

export default function UnusualTransactionsPanel({ period = 'this_month' }) {
  const resolve = useResolveCategory();
  const { fetchDashboard } = useAnalytics(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    analyticsApi
      .anomalies(period)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const acknowledge = async (id) => {
    try {
      await transactionApi.acknowledgeAnomaly(id);
      setData((prev) => {
        if (!prev) return prev;
        const items = prev.items.filter((i) => i.id !== id);
        return { ...prev, items, count: items.length };
      });
      fetchDashboard();
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl bg-surface-2" />;
  }

  const items = data?.items ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted">Unusual expenses</CardTitle>
        <Link to={ROUTES.TRANSACTIONS} className="text-xs text-primary hover:underline">
          Transactions →
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing unusual in this period. Checks need at least 5 past expenses in a category.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((a) => (
              <li key={a.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    <span className="mr-1" aria-hidden>⚠️</span>
                    {a.description}
                  </p>
                  <p className="text-xs text-muted">
                    {resolve(a.category).label}
                    {' · '}
                    {formatDate(a.date)}
                    {' · '}
                    z={a.z_score}
                  </p>
                  {a.reason && (
                    <p className={cn('mt-1 text-xs', a.severity === 'high' ? 'text-foreground' : 'text-muted')}>
                      {a.reason}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">
                    <CurrencyDisplay amount={a.amount} />
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => acknowledge(a.id)}
                  >
                    Looks correct
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
