import toast from 'react-hot-toast';
import transactionApi from '@/api/transactionApi';
import { getApiErrorMessage } from '@/utils/apiError';

export function showDeleteToast(id, onRestore) {
  toast((t) => (
    <div className="flex items-center gap-3">
      <span className="text-sm">Moved to trash</span>
      <button
        type="button"
        className="text-sm font-semibold text-primary hover:underline"
        onClick={async () => {
          toast.dismiss(t.id);
          try {
            await transactionApi.restore(id);
            toast.success('Transaction restored');
            onRestore?.();
          } catch (err) {
            toast.error(getApiErrorMessage(err, 'Could not restore'));
          }
        }}
      >
        Undo
      </button>
    </div>
  ), { duration: 8000 });
}
