import { useAnalytics } from '@/hooks/useAnalytics';

/** Whether the user has logged any transactions (for smarter empty states). */
export function useHasTransactions() {
  const { dashboard } = useAnalytics(true);
  const count = dashboard?.total_transactions;
  return {
    hasTransactions: count == null ? null : count > 0,
    totalTransactions: count ?? 0,
    ready: count != null,
  };
}

export default useHasTransactions;
