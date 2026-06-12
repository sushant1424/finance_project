import { useState } from 'react';
import * as XLSX from 'xlsx';
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

  const handleDuplicate = async (tx) => {
    const ok = await confirm({
      title: 'Duplicate transaction?',
      description: `Create a copy of "${tx.description}" with today's date?`,
      confirmLabel: 'Duplicate',
    });
    if (!ok) return;
    const data = {
      description: tx.description,
      amount: tx.amount,
      category: tx.category,
      type: tx.type,
      date: new Date().toISOString().split('T')[0],
    };
    const r = await create(data);
    if (r?.meta?.requestStatus === 'fulfilled') {
      if (r.payload?.is_anomaly) {
        toast('⚠️ Unusual expense detected!', { style: { background: '#422006', color: '#fef3c7', border: '1px solid #f59e0b' } });
      } else {
        toast.success('Transaction duplicated');
      }
      fetch();
    }
  };

  const handleExport = async (format) => {
    const ok = await confirm({ title: `Export ${format.toUpperCase()}?`, description: 'Download all filtered transactions.', confirmLabel: 'Export' });
    if (!ok) return;
    try {
      const blob = await exportCsv();
      const text = await new Response(blob).text();
      if (format === 'xlsx') {
        const rows = text.trim().split('\n').map((r) => r.split(','));
        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, 'transactions.xlsx');
      } else {
        const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(`${format.toUpperCase()} exported`);
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>Export CSV</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>Export Excel</Button>
        </div>
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
        onDuplicate={handleDuplicate}
        showSelection
        searchQuery={filters.search || ''}
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
