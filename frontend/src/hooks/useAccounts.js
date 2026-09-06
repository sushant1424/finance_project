import { useCallback, useEffect, useState } from 'react';
import accountApi from '@/api/accountApi';

export function useAccounts(autoFetch = true) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountApi.list();
      setAccounts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  return {
    accounts,
    loading,
    fetch,
    create: accountApi.create,
    update: accountApi.update,
    setDefault: accountApi.setDefault,
    remove: accountApi.remove,
  };
}

export default useAccounts;
