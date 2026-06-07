import PageHeader from '@/components/common/PageHeader';
import NetWorthChart from '@/features/networth/NetWorthChart';
import AssetsLiabilities from '@/features/networth/AssetsLiabilities';
import UpdateNetWorthDialog from '@/features/networth/UpdateNetWorthDialog';

export default function NetWorthPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Net Worth" description="Track your assets and liabilities over time." action={<UpdateNetWorthDialog />} />
      <NetWorthChart />
      <AssetsLiabilities />
    </div>
  );
}
