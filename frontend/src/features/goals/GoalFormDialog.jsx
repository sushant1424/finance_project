import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import GoalForm from '@/components/goals/GoalForm';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function GoalFormDialog() {
  const [open, setOpen] = useState(false);
  const { create } = useGoals(false);
  const confirm = useConfirm();

  const onSubmit = async (data) => {
    const ok = await confirm({ title: 'Create goal?', description: `Create "${data.name}" with target NPR ${data.target_amount}?`, confirmLabel: 'Create' });
    if (!ok) return;
    const result = await create(data);
    if (result?.meta?.requestStatus === 'fulfilled') { toast.success('Goal created'); setOpen(false); }
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
