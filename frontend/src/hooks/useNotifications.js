import { useCallback, useEffect, useState } from 'react';
import notificationsApi from '@/api/notificationsApi';

export function useNotifications(autoFetch = true) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.list();
      setItems(data.items ?? []);
      setUnreadCount(data.unread_count ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  const markRead = useCallback(async (id) => {
    await notificationsApi.markRead(id);
    await fetch();
  }, [fetch]);

  return { items, unreadCount, loading, fetch, markRead };
}

export default useNotifications;
