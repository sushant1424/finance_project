import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SkeletonCard from '@/components/common/SkeletonCard';
import CashFlowAreaChart from '@/components/charts/CashFlowAreaChart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { DEFAULT_CHART_HEIGHT } from '@/constants/chartConfig';

export default function DashboardCharts() {
  const { cashflow, fetchCashflow, loading } = useAnalytics();

  useEffect(() => { fetchCashflow(6); }, [fetchCashflow]);

  if (loading && !cashflow.length) return <SkeletonCard className="h-[340px]" />;

  return (
    <Card>
      <CardHeader><CardTitle>Cashflow (6 months)</CardTitle></CardHeader>
      <CardContent>
        <CashFlowAreaChart data={cashflow} height={DEFAULT_CHART_HEIGHT} />
      </CardContent>
    </Card>
  );
}
