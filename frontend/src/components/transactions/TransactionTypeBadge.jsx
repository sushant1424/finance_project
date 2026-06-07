import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  income: { label: 'Income', variant: 'success' },
  expense: { label: 'Expense', variant: 'destructive' },
};

export default function TransactionTypeBadge({ type, className }) {
  const config = TYPE_CONFIG[type] ?? { label: type, variant: 'secondary' };

  return (
    <Badge variant={config.variant} className={cn('capitalize', className)}>
      {config.label}
    </Badge>
  );
}
