import PageHeader from '@/components/common/PageHeader';
import TransactionFilters from '@/features/transactions/TransactionFilters';
import TransactionTable from '@/features/transactions/TransactionTable';
import AddTransactionDialog from '@/features/transactions/AddTransactionDialog';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="View and manage your transactions." action={<AddTransactionDialog />} />
      <TransactionFilters />
      <TransactionTable />
    </div>
  );
}
