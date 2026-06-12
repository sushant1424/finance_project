import { Link } from 'react-router-dom';
import { AlertTriangle, PiggyBank, Target, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  anomaly: { icon: AlertTriangle, color: 'text-warning' },
  budget: { icon: PiggyBank, color: 'text-orange-500' },
  goal: { icon: Target, color: 'text-primary' },
};

const SEVERITY_BORDER = {
  high: 'border-danger/40',
  medium: 'border-warning/40',
  low: 'border-border',
};

export default function NotificationItem({ notification, onMarkRead }) {
  const { icon: Icon, color } = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.anomaly;
  const isUnread = !notification.read;

  return (
    <div className={cn(
      'flex gap-4 rounded-xl border bg-surface-1 p-4',
      SEVERITY_BORDER[notification.severity] ?? 'border-border',
      isUnread && 'bg-surface-2/30',
    )}>
      <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2', color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-foreground">{notification.title}</p>
          <div className="flex shrink-0 items-center gap-2">
            {notification.date && (
              <span className="text-xs text-muted">{formatRelativeTime(notification.date)}</span>
            )}
            {isUnread && <span className="h-2 w-2 rounded-full bg-primary" />}
          </div>
        </div>
        <p className="mt-1 text-sm text-muted">{notification.message}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to={notification.action_path}>View</Link>
          </Button>
          {isUnread && (
            <Button size="sm" variant="ghost" onClick={() => onMarkRead(notification.id)}>
              <Check className="mr-1 h-3.5 w-3.5" />Mark as read
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
