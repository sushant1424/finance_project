import { Receipt } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import SkeletonTable from '@/components/common/SkeletonTable';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TransactionRow from '@/components/transactions/TransactionRow';
import { cn } from '@/lib/utils';

export default function TransactionTable({
  transactions = [],
  loading = false,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
  showSelection = false,
  className,
}) {
  if (loading) return <SkeletonTable rows={8} columns={showSelection ? 6 : 5} className={className} />;

  if (!transactions.length) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Add your first transaction to start tracking your finances."
        className={className}
      />
    );
  }

  const allSelected = transactions.length > 0 && selectedIds.length === transactions.length;

  return (
    <div className={cn('rounded-xl border border-border bg-surface-1', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {showSelection && onSelectAll && (
              <TableHead className="w-10">
                <input type="checkbox" checked={allSelected} onChange={onSelectAll} className="rounded border-border" />
              </TableHead>
            )}
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {(onEdit || onDelete) && <TableHead className="w-24 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              selected={selectedIds.includes(tx.id)}
              onToggleSelect={showSelection ? onToggleSelect : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={Boolean(onEdit || onDelete)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
