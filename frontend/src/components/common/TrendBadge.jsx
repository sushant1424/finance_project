import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONFIG = {
  up: { icon: ArrowUp, label: 'Up', className: 'text-success bg-success/10' },
  down: { icon: ArrowDown, label: 'Down', className: 'text-danger bg-danger/10' },
  stable: { icon: Minus, label: 'Stable', className: 'text-muted bg-surface-2' },
};

export default function TrendBadge({ direction = 'stable', value, className }) {
  const config = CONFIG[direction] ?? CONFIG.stable;
  const Icon = config.icon;
  const numeric = typeof value === 'number' ? value : parseFloat(value);
  const displayValue = Number.isFinite(numeric) ? `${numeric}%` : null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {displayValue && <span>{displayValue}</span>}
      <span className="sr-only">{config.label}</span>
    </span>
  );
}
