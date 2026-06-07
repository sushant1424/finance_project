import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import TransactionTableUI from '@/components/transactions/TransactionTable';
import TransactionEditDialog from '@/features/transactions/TransactionEditDialog';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useTransactions } from '@/hooks/useTransactions';

export default function TransactionTable() {
  const {
    items, loading, total, filters, setFilters, selectedIds,
    toggleSelect, selectAll, clearSelection, remove, bulkDelete, exportCsv, fetch,
  } = useTransactions();
  const confirm = useConfirm();
  const [editTx, setEditTx] = useState(null);

  const handleDelete = async (tx) => {
    const ok = await confirm({
      title: 'Delete transaction?',
      description: `Delete "${tx.description}" permanently?`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;
    const r = await remove(tx.id);
    if (r?.meta?.requestStatus === 'fulfilled') { toast.success('Transaction deleted'); fetch(); }
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: `Delete ${selectedIds.length} transactions?`,
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete all',
      variant: 'destructive',
    });
    if (!ok) return;
    const r = await bulkDelete(selectedIds);
    if (r?.meta?.requestStatus === 'fulfilled') {
      clearSelection();
      toast.success('Transactions deleted');
      fetch();
    }
  };

  const handleExport = async () => {
    const ok = await confirm({ title: 'Export CSV?', description: 'Download all filtered transactions.', confirmLabel: 'Export' });
    if (!ok) return;
    try {
      const blob = await exportCsv();
      const url = URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const start = (filters.page - 1) * filters.limit + 1;
  const end = Math.min(filters.page * filters.limit, total);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{total} results</p>
        <Button variant="outline" size="sm" onClick={handleExport}>Export CSV</Button>
      </div>
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-1 px-4 py-2">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete selected</Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
        </div>
      )}
      <TransactionTableUI
        transactions={items}
        loading={loading}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectAll={() => (selectedIds.length === items.length ? clearSelection() : selectAll())}
        onEdit={setEditTx}
        onDelete={handleDelete}
        showSelection
      />
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{total ? `Showing ${start}–${end} of ${total}` : 'No results'}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={filters.page <= 1} onClick={() => setFilters({ page: filters.page - 1 })}>Previous</Button>
          <span>Page {filters.page}</span>
          <Button variant="outline" size="sm" disabled={end >= total} onClick={() => setFilters({ page: filters.page + 1 })}>Next</Button>
        </div>
      </div>
      {editTx && <TransactionEditDialog transaction={editTx} open onClose={() => setEditTx(null)} />}
    </div>
  );
}
