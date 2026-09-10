import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  to,
  className,
}) {
  const showAction = Boolean(actionLabel && (onAction || to));

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border',
        'bg-surface-1 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      )}
      {showAction && (
        to ? (
          <Button asChild className="mt-6">
            <Link to={to}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button onClick={onAction} className="mt-6">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
