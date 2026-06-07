import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import BudgetForm from '@/components/budget/BudgetForm';
import BudgetCard from '@/components/budget/BudgetCard';
import EmptyState from '@/components/common/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useBudgets } from '@/hooks/useBudgets';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function BudgetCardsGrid() {
  const { items, loading, month, year, create, update, remove, fetch } = useBudgets();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(null);

  const handleCreate = async (data) => {
    const ok = await confirm({ title: 'Create budget?', description: `Set ${data.category} limit to NPR ${data.monthly_limit}?`, confirmLabel: 'Create' });
    if (!ok) return;
    const r = await create(data);
    if (r?.meta?.requestStatus === 'fulfilled') { toast.success('Budget created'); setOpen(false); fetch(); }
  };

  const handleUpdate = async (data) => {
    const ok = await confirm({ title: 'Update budget?', confirmLabel: 'Save' });
    if (!ok) return;
    const r = await update(editBudget.id, { monthly_limit: data.monthly_limit });
    if (r?.meta?.requestStatus === 'fulfilled') { toast.success('Budget updated'); setEditBudget(null); }
  };

  const handleDelete = async (budget) => {
    const ok = await confirm({ title: 'Delete budget?', description: `Remove ${budget.category} budget?`, confirmLabel: 'Delete', variant: 'destructive' });
    if (!ok) return;
    const r = await remove(budget.id);
    if (r?.meta?.requestStatus === 'fulfilled') toast.success('Budget deleted');
  };

  if (loading && !items.length) {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Create budget</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create budget</DialogTitle></DialogHeader>
            <BudgetForm defaultValues={{ month, year }} onSubmit={handleCreate} onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {!items.length ? (
        <EmptyState title="No budgets yet" description="Set limits for your spending categories." actionLabel="Create budget" onAction={() => setOpen(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <BudgetCard key={b.id} budget={b} onEdit={setEditBudget} onDelete={handleDelete} />
          ))}
        </div>
      )}
      {editBudget && (
        <Dialog open onOpenChange={(v) => !v && setEditBudget(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit budget</DialogTitle></DialogHeader>
            <BudgetForm defaultValues={editBudget} onSubmit={handleUpdate} onCancel={() => setEditBudget(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
