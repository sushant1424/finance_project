import { useEffect } from 'react';
import SkeletonCard from '@/components/common/SkeletonCard';
import CashFlowAreaChart from '@/components/charts/CashFlowAreaChart';
import DashboardPanel from '@/features/dashboard/DashboardPanel';
import { useAnalytics } from '@/hooks/useAnalytics';

const CHART_HEIGHT = 260;

export default function DashboardCharts() {
  const { cashflow, fetchCashflow, loading } = useAnalytics();

  useEffect(() => {
    fetchCashflow(6);
  }, [fetchCashflow]);

  if (loading && !cashflow.length) {
    return <SkeletonCard className="h-full min-h-[320px]" />;
  }

  return (
    <DashboardPanel title="Cashflow" minHeight="min-h-[340px]">
      <CashFlowAreaChart data={cashflow} height={CHART_HEIGHT} />
    </DashboardPanel>
  );
}
