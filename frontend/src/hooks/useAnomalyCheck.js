import { useEffect, useState } from 'react';
import transactionApi from '@/api/transactionApi';

/**
 * Debounced Z-score anomaly check while filling Add Transaction.
 * Mirrors useCategorySuggestion timing (400ms).
 */
export function useAnomalyCheck(amount, category, type) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (type !== 'expense') {
      setResult(null);
      return;
    }
    const n = Number(amount);
    if (!category || !Number.isFinite(n) || n <= 0) {
      setResult(null);
      return;
    }
    const timer = setTimeout(() => {
      transactionApi
        .checkAnomaly({ category, amount: n, type })
        .then((res) => {
          if (res?.status === 'anomaly') setResult(res);
          else setResult(null);
        })
        .catch(() => setResult(null));
    }, 400);
    return () => clearTimeout(timer);
  }, [amount, category, type]);

  return result;
}
