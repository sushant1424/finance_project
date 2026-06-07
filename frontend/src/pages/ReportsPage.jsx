import PageHeader from '@/components/common/PageHeader';
import ReportsTabs from '@/features/reports/ReportsTabs';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Analyze spending, income, and trends." />
      <ReportsTabs />
    </div>
  );
}
