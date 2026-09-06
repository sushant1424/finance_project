import { useEffect, useState } from 'react';
import transactionApi from '@/api/transactionApi';

/** Debounced category suggestion from transaction description. */
export function useCategorySuggestion(description, type) {
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    if (!description || description.trim().length < 2) {
      setSuggestion(null);
      return;
    }
    const timer = setTimeout(() => {
      transactionApi.suggestCategory(description, type)
        .then((res) => {
          const cat = res?.category ?? res;
          setSuggestion(cat || null);
        })
        .catch(() => setSuggestion(null));
    }, 400);
    return () => clearTimeout(timer);
  }, [description, type]);

  return suggestion;
}
