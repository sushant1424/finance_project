import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, PiggyBank, RefreshCw, Target, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const TYPE_META = {
  budget: { icon: PiggyBank, label: 'Budget' },
  goal: { icon: Target, label: 'Goal' },
  bill: { icon: RefreshCw, label: 'Bill' },
  balance: { icon: Wallet, label: 'Balance' },
  anomaly: { icon: AlertTriangle, label: 'Unusual' },
};

const SEVERITY_CLASS = {
  high: 'border-danger/30 bg-danger/5',
  medium: 'border-warning/30 bg-warning/5',
  low: 'border-border bg-surface-1',
};

export default function NotificationList({ items, onMarkRead }) {
  return (
    <ul className="space-y-2">
      {items.map((n) => {
        const meta = TYPE_META[n.type] ?? { icon: Bell, label: n.type };
        const Icon = meta.icon;
        return (
          <li key={n.id}>
            <div
              className={cn(
                'flex items-start gap-3 rounded-xl border px-4 py-3',
                SEVERITY_CLASS[n.severity] ?? SEVERITY_CLASS.low,
                n.read && 'opacity-60',
              )}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                <Icon className="h-4 w-4 text-muted" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase text-muted">
                    {meta.label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{n.message}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {n.action_path && (
                    <Link to={n.action_path} className="text-xs text-primary hover:underline">
                      Open →
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(n.id)}
                      className="text-xs text-muted hover:text-foreground"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
