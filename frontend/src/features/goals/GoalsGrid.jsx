import { useState } from 'react';
import toast from 'react-hot-toast';
import GoalCard from '@/components/goals/GoalCard';
import GoalForm from '@/components/goals/GoalForm';
import EmptyState from '@/components/common/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useGoals } from '@/hooks/useGoals';
import { toISODateString } from '@/utils/formatDate';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ContributeForm({ goal, onSubmit, onCancel }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toISODateString(new Date()));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ amount: parseFloat(amount), date }); }} className="space-y-4">
      <div><Label>Amount</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" required /></div>
      <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" required /></div>
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Add funds</Button></div>
    </form>
  );
}

export default function GoalsGrid() {
  const { items, loading, update, remove, contribute } = useGoals();
  const confirm = useConfirm();
  const [editGoal, setEditGoal] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);

  const handleUpdate = async (data) => {
    const ok = await confirm({ title: 'Update goal?', confirmLabel: 'Save' });
    if (!ok) return;
    const r = await update(editGoal.id, data);
    if (r?.meta?.requestStatus === 'fulfilled') { toast.success('Goal updated'); setEditGoal(null); }
  };

  const handleDelete = async (goal) => {
    const ok = await confirm({ title: 'Delete goal?', description: `Delete "${goal.name}"?`, confirmLabel: 'Delete', variant: 'destructive' });
    if (!ok) return;
    const r = await remove(goal.id);
    if (r?.meta?.requestStatus === 'fulfilled') toast.success('Goal deleted');
  };

  const handleContribute = async (data) => {
    const ok = await confirm({ title: 'Add contribution?', description: `Add NPR ${data.amount} to "${contributeGoal.name}"?`, confirmLabel: 'Add' });
    if (!ok) return;
    const r = await contribute(contributeGoal.id, data);
    if (r?.meta?.requestStatus === 'fulfilled') { toast.success('Contribution added'); setContributeGoal(null); }
  };

  if (loading && !items.length) {
    return <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}</div>;
  }

  if (!items.length) return <EmptyState title="No goals yet" description="Create a savings goal to start tracking progress." />;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((g) => (
          <GoalCard key={g.id} goal={g} onEdit={setEditGoal} onDelete={handleDelete} onContribute={setContributeGoal} />
        ))}
      </div>
      {editGoal && (
        <Dialog open onOpenChange={(v) => !v && setEditGoal(null)}>
          <DialogContent><DialogHeader><DialogTitle>Edit goal</DialogTitle></DialogHeader>
            <GoalForm defaultValues={{ ...editGoal, target_date: editGoal.target_date?.slice?.(0, 10) ?? editGoal.target_date }} onSubmit={handleUpdate} onCancel={() => setEditGoal(null)} />
          </DialogContent>
        </Dialog>
      )}
      {contributeGoal && (
        <Dialog open onOpenChange={(v) => !v && setContributeGoal(null)}>
          <DialogContent><DialogHeader><DialogTitle>Add funds — {contributeGoal.name}</DialogTitle></DialogHeader>
            <ContributeForm goal={contributeGoal} onSubmit={handleContribute} onCancel={() => setContributeGoal(null)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
