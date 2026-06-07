import EmptyState from '@/components/common/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';
import NotificationItem from '@/components/notifications/NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react';

export default function NotificationList() {
  const { items, loading, markRead } = useNotifications();

  if (loading && !items.length) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} className="h-24" />)}</div>;
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={Bell}
        title="All clear"
        description="No active alerts. Anomalies, budget warnings, and goal reminders will show up here."
      />
    );
  }

  const groups = [
    { key: 'anomaly', label: 'Anomalies' },
    { key: 'budget', label: 'Budget warnings' },
    { key: 'goal', label: 'Goal reminders' },
  ];

  return (
    <div className="space-y-8">
      {groups.map(({ key, label }) => {
        const group = items.filter((n) => n.type === key);
        if (!group.length) return null;
        return (
          <section key={key}>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted">{label}</h2>
            <div className="space-y-3">
              {group.map((n) => <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
