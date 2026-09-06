import { useCallback, useEffect, useState } from 'react';
import categoryApi from '@/api/categoryApi';

export function useCategories() {
  const [custom, setCustom] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryApi.list();
      setCustom(data ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (data) => {
    const cat = await categoryApi.create(data);
    setCustom((prev) => [...prev, cat]);
    return cat;
  }, []);

  const update = useCallback(async (id, data) => {
    const cat = await categoryApi.update(id, data);
    setCustom((prev) => prev.map((c) => (c.id === id ? cat : c)));
    return cat;
  }, []);

  const remove = useCallback(async (id) => {
    await categoryApi.remove(id);
    setCustom((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { custom, loading, fetch, create, update, remove };
}

export default useCategories;
