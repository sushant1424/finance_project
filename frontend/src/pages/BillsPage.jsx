import PageHeader from '@/components/common/PageHeader';
import BillsPanel from '@/features/bills/BillsPanel';

export default function BillsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Bills"
        description="Subscriptions and recurring payments."
      />
      <BillsPanel />
    </div>
  );
}
