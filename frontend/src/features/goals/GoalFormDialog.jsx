import { useState } from 'react';
import { Plus } from 'lucide-react';
import GoalForm from '@/components/goals/GoalForm';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useGoals } from '@/hooks/useGoals';
import { toastAsyncResult } from '@/utils/toastAsyncResult';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function GoalFormDialog() {
  const [open, setOpen] = useState(false);
  const { create } = useGoals(false);
  const confirm = useConfirm();

  const onSubmit = async (data) => {
    const ok = await confirm({ title: 'Create goal?', description: `Create "${data.name}" with target ${formatCurrency(data.target_amount, undefined, false)}?`, confirmLabel: 'Create' });
    if (!ok) return;
    const result = await create(data);
    if (toastAsyncResult(result, { success: 'Goal created', error: 'Failed to create goal' })) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4" />New goal</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create goal</DialogTitle></DialogHeader>
        <GoalForm onSubmit={onSubmit} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
