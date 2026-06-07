import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import TransactionForm from '@/components/transactions/TransactionForm';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const { create, fetch } = useTransactions(false);
  const confirm = useConfirm();

  const onSubmit = async (data) => {
    const ok = await confirm({
      title: 'Add transaction?',
      description: `Add ${data.type} of NPR ${data.amount} for "${data.description}"?`,
      confirmLabel: 'Add',
    });
    if (!ok) return;
    const result = await create(data);
    if (result?.meta?.requestStatus === 'fulfilled') {
      if (result.payload?.is_anomaly) {
        toast('⚠️ Unusual expense detected!', { style: { background: '#422006', color: '#fef3c7', border: '1px solid #f59e0b' } });
      } else toast.success('Transaction added');
      setOpen(false);
      fetch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Add transaction</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add transaction</DialogTitle></DialogHeader>
        <TransactionForm onSubmit={onSubmit} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
