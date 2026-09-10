import { useEffect, useMemo, useState } from 'react';
import analyticsApi from '@/api/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDateRange } from '@/hooks/useDateRange';
import { filterSeriesByDateRange } from '@/utils/dateRangeMonths';
import { completeSavingsMonths, isIncompleteSavingsMonth } from '@/utils/savingsRate';

/** Summary tiles above the savings-rate chart. */
export default function SavingsSummaryCards() {
  const [data, setData] = useState([]);
  const { from, to } = useDateRange();

  useEffect(() => {
    analyticsApi.savingsRate().then(setData).catch(() => {});
  }, []);

  const filtered = useMemo(
    () => filterSeriesByDateRange(data, from, to),
    [data, from, to],
  );

  if (!filtered.length) return null;

  const currentRow = filtered[filtered.length - 1];
  const current = currentRow?.rate ?? 0;
  const currentIncomplete = isIncompleteSavingsMonth(currentRow);
  const noIncome = Number(currentRow?.income) <= 0;

  const complete = completeSavingsMonths(filtered);
  const avgSource = complete.length ? complete : filtered;
  const avg = (
    avgSource.reduce((a, b) => a + b.rate, 0) / avgSource.length
  ).toFixed(1);

  const rankable = complete.length ? complete : filtered.filter((d) => Number(d.income) > 0);
  let best = null;
  let bestMonth = '';
  let bestIncomplete = false;
  if (rankable.length) {
    const bestIdx = rankable.reduce(
      (bestI, d, i, arr) => (d.rate > arr[bestI].rate ? i : bestI),
      0,
    );
    best = rankable[bestIdx].rate.toFixed(1);
    bestMonth = rankable[bestIdx]?.label ?? '';
    bestIncomplete = isIncompleteSavingsMonth(rankable[bestIdx]);
  }

  const color = (r) =>
    r >= 20 ? 'text-success' : r >= 0 ? 'text-warning' : 'text-danger';

  return (
    <div className="space-y-4">
      {noIncome && (
        <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3 text-sm text-muted">
          Can&apos;t calculate savings rate without income this month
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {noIncome ? (
              <>
                <p className="text-2xl font-bold text-muted">—</p>
                <p className="mt-0.5 text-xs text-muted">No income logged</p>
              </>
            ) : (
              <>
                <p className={`text-2xl font-bold ${currentIncomplete ? 'text-muted' : color(current)}`}>
                  {current}%
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {currentIncomplete
                    ? 'Incomplete data — no expenses logged'
                    : current >= 20
                      ? 'Great savings rate'
                      : current >= 0
                        ? 'Below the 20% target'
                        : 'Spending more than earning'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted">
              {complete.length && complete.length < filtered.length
                ? 'Average (complete months)'
                : 'Period Average'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${color(Number(avg))}`}>{avg}%</p>
            <p className="mt-0.5 text-xs text-muted">
              {complete.length && complete.length < filtered.length
                ? `Excludes ${filtered.length - complete.length} month(s) with no expenses`
                : 'Average savings rate'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted">Best Month</CardTitle>
          </CardHeader>
          <CardContent>
            {best == null ? (
              <>
                <p className="text-2xl font-bold text-muted">—</p>
                <p className="mt-0.5 text-xs text-muted">Not enough data</p>
              </>
            ) : (
              <>
                <p className={`text-2xl font-bold ${bestIncomplete ? 'text-muted' : 'text-success'}`}>
                  {best}%
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {bestMonth}
                  {bestIncomplete ? ' · incomplete data' : ''}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
