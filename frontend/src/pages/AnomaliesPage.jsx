import PageHeader from '@/components/common/PageHeader';
import AnomalyFilters from '@/features/anomalies/AnomalyFilters';
import AnomalyScatterPlot from '@/features/anomalies/AnomalyScatterPlot';
import AnomalyTable from '@/features/anomalies/AnomalyTable';

export default function AnomaliesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Anomalies" description="Review unusual transactions flagged by FinSight." />
      <AnomalyFilters />
      <AnomalyScatterPlot />
      <AnomalyTable />
    </div>
  );
}
