import PageHeader from '@/components/common/PageHeader';
import MonthOverview from '@/features/dashboard/MonthOverview';
import ReportsTabs from '@/features/reports/ReportsTabs';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Analyze spending, income, and trends." />
      <MonthOverview />
      <ReportsTabs />
    </div>
  );
}
