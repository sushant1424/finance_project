import { Button } from '@/components/ui/button';
import PageHeader from '@/components/common/PageHeader';
import NotificationList from '@/features/notifications/NotificationList';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsPage() {
  const { unreadCount, markAllRead, loading } = useNotifications();

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-sm font-semibold text-danger">
                {unreadCount} unread
              </span>
            )}
          </span>
        }
        description="Anomaly alerts, budget warnings, and goal reminders in one place."
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead} disabled={loading}>
              Mark all as read
            </Button>
          ) : null
        }
      />
      <NotificationList />
    </div>
  );
}
