import toast from 'react-hot-toast';
import TransactionForm from '@/components/transactions/TransactionForm';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useTransactions } from '@/hooks/useTransactions';
import { toastAsyncResult } from '@/utils/toastAsyncResult';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function TransactionEditDialog({ transaction, open, onClose }) {
  const { update, fetch } = useTransactions(false);
  const confirm = useConfirm();

  const onSubmit = async (data) => {
    const ok = await confirm({
      title: 'Save changes?',
      description: `Update "${data.description}"?`,
      confirmLabel: 'Save',
    });
    if (!ok) return;
    const result = await update(transaction.id, data);
    if (toastAsyncResult(result, { success: 'Transaction updated', error: 'Failed to update transaction' })) {
      fetch();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit transaction</DialogTitle></DialogHeader>
        <TransactionForm
          defaultValues={{ ...transaction, amount: transaction.amount, date: transaction.date?.slice?.(0, 10) ?? transaction.date }}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
