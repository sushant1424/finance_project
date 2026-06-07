import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { getPaceLabel } from '@/utils/budgetPace';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  on_track: { icon: CheckCircle2, className: 'text-success bg-success/10' },
  at_risk: { icon: AlertTriangle, className: 'text-warning bg-warning/10' },
  will_exceed: { icon: TrendingUp, className: 'text-warning bg-warning/10' },
  exceeded: { icon: AlertTriangle, className: 'text-danger bg-danger/10' },
};

export default function BudgetPaceIndicator({ pace, className }) {
  if (!pace) return null;

  const config = STATUS_CONFIG[pace.status] ?? STATUS_CONFIG.on_track;
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-medium', config.className, className)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{getPaceLabel(pace.status)}</span>
      {(pace.daysUntilExceeded ?? pace.days_until_exceeded) != null && pace.status === 'will_exceed' && (
        <span className="text-muted">· ~{pace.daysUntilExceeded ?? pace.days_until_exceeded}d left</span>
      )}
    </div>
  );
}
