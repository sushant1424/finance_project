import { useState } from 'react';
import GoalCard from '@/components/goals/GoalCard';
import GoalForm from '@/components/goals/GoalForm';
import EmptyState from '@/components/common/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useGoals } from '@/hooks/useGoals';
import { useAccounts } from '@/hooks/useAccounts';
import { toastAsyncResult } from '@/utils/toastAsyncResult';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContributeForm, ConvertForm, WithdrawForm } from '@/features/goals/GoalActionForms';

export default function GoalsGrid() {
  const { items, loading, update, remove, contribute, complete, withdraw, convert, fetch } = useGoals();
  const { accounts, fetch: refreshAccounts } = useAccounts();
  const confirm = useConfirm();
  const [editGoal, setEditGoal] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [withdrawGoal, setWithdrawGoal] = useState(null);
  const [convertGoal, setConvertGoal] = useState(null);

  const handleUpdate = async (data) => {
    const ok = await confirm({ title: 'Update goal?', confirmLabel: 'Save' });
    if (!ok) return;
    const r = await update(editGoal.id, data);
    if (toastAsyncResult(r, { success: 'Goal updated', error: 'Failed to update goal' })) {
      setEditGoal(null);
    }
  };

  const handleDelete = async (goal) => {
    const ok = await confirm({
      title: 'Delete goal?',
      description: `Delete "${goal.name}"?`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;
    toastAsyncResult(await remove(goal.id), { success: 'Goal deleted', error: 'Failed to delete goal' });
  };

  const handleContribute = async (data) => {
    const ok = await confirm({
      title: 'Add contribution?',
      description: `Move NPR ${data.amount} from your account into "${contributeGoal.name}"?`,
      confirmLabel: 'Add',
    });
    if (!ok) return;
    const r = await contribute(contributeGoal.id, data);
    if (toastAsyncResult(r, { success: 'Contribution added', error: 'Failed to add contribution' })) {
      setContributeGoal(null);
      fetch();
      refreshAccounts();
    }
  };

  const handleComplete = async (goal) => {
    const ok = await confirm({
      title: 'Mark goal done?',
      description: `Celebrate "${goal.name}" as completed. You can still withdraw or convert the savings.`,
      confirmLabel: 'Mark done',
    });
    if (!ok) return;
    toastAsyncResult(await complete(goal.id), {
      success: 'Goal reached — nice work!',
      error: 'Failed to complete goal',
    });
  };

  const handleWithdraw = async (data) => {
    const ok = await confirm({
      title: 'Withdraw goal savings?',
      description: `Move funds from "${withdrawGoal.name}" back to your account and close the goal.`,
      confirmLabel: 'Withdraw',
    });
    if (!ok) return;
    const r = await withdraw(withdrawGoal.id, data);
    if (toastAsyncResult(r, { success: 'Goal withdrawn', error: 'Failed to withdraw' })) {
      setWithdrawGoal(null);
      fetch();
      refreshAccounts();
    }
  };

  const handleConvert = async (data) => {
    const ok = await confirm({
      title: 'Convert to new goal?',
      description: `Close "${convertGoal.name}" and start "${data.name}" with the saved balance.`,
      confirmLabel: 'Convert',
    });
    if (!ok) return;
    const r = await convert(convertGoal.id, data);
    if (toastAsyncResult(r, { success: 'Converted to new goal', error: 'Failed to convert' })) {
      setConvertGoal(null);
      fetch();
    }
  };

  if (loading && !items.length) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!items.length) {
    return <EmptyState title="No goals yet" description="Create a savings goal to start tracking progress." />;
  }

  const active = items.filter(
    (g) => g.goal_status === 'active' || (g.goal_status === 'completed' && Number(g.current_amount) > 0),
  );
  const closed = items.filter(
    (g) => g.goal_status === 'withdrawn' || (g.goal_status === 'completed' && !(Number(g.current_amount) > 0)),
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {active.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            onEdit={setEditGoal}
            onDelete={handleDelete}
            onContribute={setContributeGoal}
            onComplete={handleComplete}
            onWithdraw={setWithdrawGoal}
            onConvert={setConvertGoal}
          />
        ))}
      </div>

      {closed.length > 0 && (
        <div className="space-y-3 pt-4">
          <p className="text-sm font-medium text-muted">Closed goals</p>
          <div className="grid gap-4 opacity-70 sm:grid-cols-2">
            {closed.map((g) => (
              <GoalCard key={g.id} goal={g} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {editGoal && (
        <Dialog open onOpenChange={(v) => !v && setEditGoal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit goal</DialogTitle></DialogHeader>
            <GoalForm
              defaultValues={{
                ...editGoal,
                target_date: editGoal.target_date?.slice?.(0, 10) ?? editGoal.target_date,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditGoal(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {contributeGoal && (
        <Dialog open onOpenChange={(v) => !v && setContributeGoal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add funds — {contributeGoal.name}</DialogTitle></DialogHeader>
            <ContributeForm accounts={accounts} onSubmit={handleContribute} onCancel={() => setContributeGoal(null)} />
          </DialogContent>
        </Dialog>
      )}

      {withdrawGoal && (
        <Dialog open onOpenChange={(v) => !v && setWithdrawGoal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Withdraw — {withdrawGoal.name}</DialogTitle></DialogHeader>
            <WithdrawForm accounts={accounts} onSubmit={handleWithdraw} onCancel={() => setWithdrawGoal(null)} />
          </DialogContent>
        </Dialog>
      )}

      {convertGoal && (
        <Dialog open onOpenChange={(v) => !v && setConvertGoal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Convert — {convertGoal.name}</DialogTitle></DialogHeader>
            <ConvertForm goal={convertGoal} onSubmit={handleConvert} onCancel={() => setConvertGoal(null)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
