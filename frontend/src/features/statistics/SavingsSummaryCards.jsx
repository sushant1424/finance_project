import { useEffect, useState } from 'react';
import analyticsApi from '@/api/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/** Summary tiles above the savings-rate chart. */
export default function SavingsSummaryCards() {
  const [data, setData] = useState([]);

  useEffect(() => {
    analyticsApi.savingsRate().then(setData).catch(() => {});
  }, []);

  if (!data.length) return null;

  const rates = data.map((d) => d.rate);
  const avg = (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1);
  const bestIdx = rates.indexOf(Math.max(...rates));
  const best = rates[bestIdx].toFixed(1);
  const bestMonth = data[bestIdx]?.label ?? '';
  const current = data[data.length - 1]?.rate ?? 0;

  const color = (r) =>
    r >= 20 ? 'text-success' : r >= 0 ? 'text-warning' : 'text-danger';

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${color(current)}`}>{current}%</p>
          <p className="mt-0.5 text-xs text-muted">
            {current >= 20 ? 'Great savings rate' : current >= 0 ? 'Below the 20% target' : 'Spending more than earning'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted">12-Month Average</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${color(Number(avg))}`}>{avg}%</p>
          <p className="mt-0.5 text-xs text-muted">Average savings rate</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-medium text-muted">Best Month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-success">{best}%</p>
          <p className="mt-0.5 text-xs text-muted">{bestMonth}</p>
        </CardContent>
      </Card>
    </div>
  );
}
