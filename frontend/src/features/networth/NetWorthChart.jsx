import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SkeletonCard from '@/components/common/SkeletonCard';
import NetWorthChartUI from '@/components/charts/NetWorthChart';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import TrendBadge from '@/components/common/TrendBadge';
import { useNetWorth } from '@/hooks/useNetWorth';
import { DEFAULT_CHART_HEIGHT } from '@/constants/chartConfig';

export default function NetWorthChart() {
  const { snapshots, latest, change, loading } = useNetWorth();

  if (loading && !snapshots.length) return <SkeletonCard className="h-[340px]" />;

  const chartData = [...snapshots].reverse().map((s) => ({
    date: s.snapshot_date,
    net_worth: s.net_worth,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Net worth over time</CardTitle>
          {latest && <p className="mt-1 text-2xl font-semibold tabular-nums"><CurrencyDisplay amount={latest.net_worth} /></p>}
        </div>
        {latest && <TrendBadge direction={change.change >= 0 ? 'up' : 'down'} value={`${Math.abs(change.changePct)}%`} />}
      </CardHeader>
      <CardContent>
        <NetWorthChartUI data={chartData} height={DEFAULT_CHART_HEIGHT} />
      </CardContent>
    </Card>
  );
}
