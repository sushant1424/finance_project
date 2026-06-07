import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SkeletonCard from '@/components/common/SkeletonCard';
import AnomalyScatterPlotUI from '@/components/charts/AnomalyScatterPlot';
import { useAnomalies } from '@/hooks/useAnomalies';
import { DEFAULT_CHART_HEIGHT } from '@/constants/chartConfig';

export default function AnomalyScatterPlot() {
  const { items, loading } = useAnomalies();
  if (loading && !items.length) return <SkeletonCard className="h-[340px]" />;
  return (
    <Card>
      <CardHeader><CardTitle>Anomaly scatter plot</CardTitle></CardHeader>
      <CardContent><AnomalyScatterPlotUI data={items} height={DEFAULT_CHART_HEIGHT} /></CardContent>
    </Card>
  );
}
