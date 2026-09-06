import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import TransactionForm from '@/components/transactions/TransactionForm';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useTransactions } from '@/hooks/useTransactions';
import { toastAsyncResult } from '@/utils/toastAsyncResult';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function AddTransactionDialog({
  defaultValues,
  onSuccess,
  /** Lock account select to defaultValues.account_id (account detail page). */
  lockAccount = false,
  /** Compact circular FAB for mobile / dashboard corner */
  floating = false,
}) {
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
    if (toastAsyncResult(result, { error: 'Failed to add transaction' })) {
      toast.success('Transaction added');
      setOpen(false);
      fetch();
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={floating ? 'icon' : 'default'}
          className={cn(
            floating &&
              'fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg lg:bottom-6 lg:right-6',
          )}
          aria-label="Add transaction"
        >
          <Plus className={cn('h-4 w-4', floating && 'h-5 w-5')} />
          {!floating && 'Add transaction'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          defaultValues={defaultValues}
          lockAccount={lockAccount}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
