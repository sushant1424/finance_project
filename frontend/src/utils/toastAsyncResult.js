import toast from 'react-hot-toast';

/**
 * Show success/error toasts based on an RTK async thunk dispatch result.
 * Returns true when the action fulfilled.
 */
export function toastAsyncResult(result, { success, error = 'Something went wrong' } = {}) {
  if (result?.meta?.requestStatus === 'fulfilled') {
    if (success) toast.success(success);
    return true;
  }

  if (result?.meta?.requestStatus === 'rejected') {
    toast.error(result.payload || error);
    return false;
  }

  return false;
}
