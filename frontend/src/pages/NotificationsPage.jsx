import PageHeader from '@/components/common/PageHeader';
import NotificationList from '@/features/notifications/NotificationList';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Anomaly alerts, budget warnings, and goal reminders in one place."
      />
      <NotificationList />
    </div>
  );
}
