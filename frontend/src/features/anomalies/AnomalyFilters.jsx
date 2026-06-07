import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useAnomalies } from '@/hooks/useAnomalies';

export default function AnomalyFilters() {
  const { filters, setFilters, recalculate, loading } = useAnomalies(false);
  const confirm = useConfirm();

  const handleRecalculate = async () => {
    const ok = await confirm({
      title: 'Recalculate anomalies?',
      description: 'This will re-run Z-Score analysis on all your expense transactions.',
      confirmLabel: 'Recalculate',
    });
    if (!ok) return;
    await recalculate();
    toast.success('Anomalies recalculated');
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select value={filters.severity ?? 'all'} onValueChange={(v) => setFilters({ severity: v === 'all' ? null : v, page: 1 })}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Severity" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All severity</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.category ?? 'all'} onValueChange={(v) => setFilters({ category: v === 'all' ? null : v, page: 1 })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.reviewed === null ? 'all' : String(filters.reviewed)}
        onValueChange={(v) => setFilters({ reviewed: v === 'all' ? null : v === 'true', page: 1 })}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="false">Unreviewed</SelectItem>
          <SelectItem value="true">Reviewed</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={handleRecalculate} disabled={loading}>Recalculate</Button>
    </div>
  );
}
