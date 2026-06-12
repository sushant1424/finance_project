import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import analyticsApi from '@/api/analyticsApi';
import { getCategoryById } from '@/constants/categories';

export default function SpendingDigest() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.digest().then((d) => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Spending Digest</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-2" />)}</div></CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const changeUp = data.week_change_pct != null && data.week_change_pct > 0;
  const changePct = data.week_change_pct;
  const topCat = data.top_category ? getCategoryById(data.top_category) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Spending Digest
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {/* Today */}
          <div className="rounded-lg bg-surface-1 border border-border p-3">
            <p className="text-xs text-muted mb-1">Today</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              <CurrencyDisplay amount={data.today_total} />
            </p>
            <p className="text-xs text-muted">{data.today_count} transaction{data.today_count !== 1 ? 's' : ''}</p>
          </div>

          {/* This Week */}
          <div className="rounded-lg bg-surface-1 border border-border p-3">
            <p className="text-xs text-muted mb-1">This Week</p>
            <p className="text-lg font-bold tabular-nums text-foreground">
              <CurrencyDisplay amount={data.week_total} />
            </p>
            <p className="text-xs text-muted">{data.week_count} transaction{data.week_count !== 1 ? 's' : ''}</p>
          </div>

          {/* Week vs Last Week */}
          <div className="rounded-lg bg-surface-1 border border-border p-3">
            <p className="text-xs text-muted mb-1">vs Last Week</p>
            {changePct != null ? (
              <div className={`flex items-center gap-1 text-sm font-semibold ${changeUp ? 'text-danger' : 'text-success'}`}>
                {changeUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(changePct)}%
              </div>
            ) : (
              <p className="text-sm text-muted">No prior data</p>
            )}
            {data.last_week_total > 0 && (
              <p className="text-xs text-muted mt-1">Last: <CurrencyDisplay amount={data.last_week_total} /></p>
            )}
          </div>

          {/* Top Category */}
          <div className="rounded-lg bg-surface-1 border border-border p-3">
            <p className="text-xs text-muted mb-1">Top Category</p>
            {data.top_category ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{topCat?.icon ?? <ShoppingBag className="h-4 w-4" />}</span>
                  <p className="text-sm font-medium capitalize">{data.top_category.replace('_', ' ')}</p>
                </div>
                <p className="text-xs text-muted mt-1 tabular-nums"><CurrencyDisplay amount={data.top_category_amount} /></p>
              </>
            ) : (
              <p className="text-sm text-muted">None yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
