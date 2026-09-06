import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NotificationList from '@/features/notifications/NotificationList';
import notificationApi from '@/api/notificationApi';

export default function NotificationsPage() {
  const [data, setData] = useState({ items: [], unread_count: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.list();
      setData(res ?? { items: [], unread_count: 0 });
    } catch {
      setData({ items: [], unread_count: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markAll = async () => {
    await notificationApi.markAllRead();
    load();
  };

  const markOne = async (id) => {
    await notificationApi.markRead(id);
    load();
  };

  const items = data.items ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="Budgets, goals, bills, and other alerts in one place."
        action={
          items.some((n) => !n.read) ? (
            <Button variant="outline" size="sm" onClick={markAll}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          ) : null
        }
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-2" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center text-muted">
            <Bell className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">You&apos;re all caught up — no alerts right now.</p>
          </CardContent>
        </Card>
      ) : (
        <NotificationList items={items} onMarkRead={markOne} />
      )}
    </div>
  );
}
