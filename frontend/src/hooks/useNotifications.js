import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/store/notificationSlice';

export function useNotifications(autoFetch = true) {
  const dispatch = useDispatch();
  const { items, unreadCount, loading } = useSelector((state) => state.notifications);

  const fetch = useCallback(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  const markRead = useCallback(
    (id) => dispatch(markNotificationRead(id)),
    [dispatch],
  );

  const markAllRead = useCallback(
    () => dispatch(markAllNotificationsRead()),
    [dispatch],
  );

  return { items, unreadCount, loading, fetch, markRead, markAllRead };
}

export default useNotifications;
