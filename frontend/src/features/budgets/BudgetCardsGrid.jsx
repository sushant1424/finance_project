import { useState } from 'react';
import { Plus } from 'lucide-react';
import BudgetForm from '@/components/budget/BudgetForm';
import BudgetCard from '@/components/budget/BudgetCard';
import EmptyState from '@/components/common/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useBudgets } from '@/hooks/useBudgets';
import { useHasTransactions } from '@/hooks/useHasTransactions';
import { toastAsyncResult } from '@/utils/toastAsyncResult';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ROUTES } from '@/constants/routes';

export default function BudgetCardsGrid() {
  const { items, loading, month, year, create, update, remove, fetch } = useBudgets();
  const { hasTransactions } = useHasTransactions();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(null);

  const handleCreate = async (data) => {
    const ok = await confirm({ title: 'Create budget?', description: `Set ${data.category} limit to ${formatCurrency(data.monthly_limit, undefined, false)}?`, confirmLabel: 'Create' });
    if (!ok) return;
    const r = await create(data);
    if (toastAsyncResult(r, { success: 'Budget created', error: 'Failed to create budget' })) {
      setOpen(false);
      fetch();
    }
  };

  const handleUpdate = async (data) => {
    const ok = await confirm({ title: 'Update budget?', confirmLabel: 'Save' });
    if (!ok) return;
    const r = await update(editBudget.id, {
      monthly_limit: data.monthly_limit,
      rollover: Boolean(data.rollover),
    });
    if (toastAsyncResult(r, { success: 'Budget updated', error: 'Failed to update budget' })) {
      setEditBudget(null);
    }
  };

  const handleDelete = async (budget) => {
    const ok = await confirm({ title: 'Delete budget?', description: `Remove ${budget.category} budget?`, confirmLabel: 'Delete', variant: 'destructive' });
    if (!ok) return;
    toastAsyncResult(await remove(budget.id), { success: 'Budget deleted', error: 'Failed to delete budget' });
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
        hasTransactions === false ? (
          <EmptyState
            title="Add your first transaction to get started"
            description="Budgets work best once you have some spending history to set limits against."
            actionLabel="Add transaction"
            to={ROUTES.TRANSACTIONS}
          />
        ) : (
          <EmptyState
            title="No budgets yet"
            description="Set limits for your spending categories."
            actionLabel="Create budget"
            onAction={() => setOpen(true)}
          />
        )
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
