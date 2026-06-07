import { useCallback, useEffect, useState } from 'react';
import anomalyApi from '@/api/anomalyApi';

const DEFAULT_FILTERS = { page: 1, limit: 20, severity: null, category: null, reviewed: null };

export function useAnomalies(autoFetch = true) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (params) => {
    const query = { ...DEFAULT_FILTERS, ...params };
    setLoading(true);
    setError(null);
    try {
      const data = await anomalyApi.list(query);
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setFilters(query);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load anomalies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetch(filters);
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  const review = useCallback(async (id) => {
    const updated = await anomalyApi.review(id);
    setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const recalculate = useCallback(async () => {
    setLoading(true);
    try {
      await anomalyApi.recalculate();
      await fetch(filters);
    } finally {
      setLoading(false);
    }
  }, [fetch, filters]);

  return {
    items,
    total,
    filters,
    loading,
    error,
    fetch,
    setFilters: useCallback((p) => fetch({ ...filters, ...p }), [fetch, filters]),
    review,
    recalculate,
  };
}

export default useAnomalies;
