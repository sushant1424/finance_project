import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/constants/categories';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';

export default function TransactionFilters() {
  const { filters, setFilters } = useTransactions(false);
  const { accounts } = useAccounts();

  const apply = (patch) => setFilters({ ...patch, page: 1 });

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[180px] flex-1">
        <Input placeholder="Search…" defaultValue={filters.search}
          onChange={(e) => apply({ search: e.target.value || undefined })} />
      </div>
      <Select value={filters.type ?? 'all'} onValueChange={(v) => apply({ type: v === 'all' ? undefined : v })}>
        <SelectTrigger className="w-[130px]"><SelectValue placeholder="Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
          <SelectItem value="transfer">Transfer</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.account_id ?? 'all'} onValueChange={(v) => apply({ account_id: v === 'all' ? undefined : v })}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Account" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.category ?? 'all'} onValueChange={(v) => apply({ category: v === 'all' ? undefined : v })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant={filters.trash ? 'default' : 'outline'}
        onClick={() => apply({ trash: !filters.trash })}
      >
        {filters.trash ? 'Showing trash' : 'Trash'}
      </Button>
      <Button variant="outline" onClick={() => setFilters({ sort_by: 'date', sort_order: 'desc', page: 1, limit: 20 })}>
        Reset
      </Button>
    </div>
  );
}
