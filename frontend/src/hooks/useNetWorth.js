import { useCallback, useEffect, useState } from 'react';
import netWorthApi from '@/api/netWorthApi';
import { computeChange } from '@/utils/netWorth';

export function useNetWorth(autoFetch = true) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await netWorthApi.listSnapshots();
      setSnapshots(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load net worth');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  const latest = snapshots[0] ?? null;
  const previous = snapshots[1] ?? null;
  const change = latest && previous
    ? computeChange(latest.net_worth, previous.net_worth)
    : { change: 0, changePct: 0 };

  return {
    snapshots,
    latest,
    change,
    loading,
    error,
    fetch,
    create: useCallback(async (data) => {
      const snap = await netWorthApi.createSnapshot(data);
      setSnapshots((prev) => [snap, ...prev]);
      return snap;
    }, []),
    remove: useCallback(async (id) => {
      await netWorthApi.deleteSnapshot(id);
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
    }, []),
  };
}

export default useNetWorth;
