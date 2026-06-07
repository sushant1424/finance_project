import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG = {
  low: { label: 'Low', variant: 'warning' },
  medium: { label: 'Medium', variant: 'default' },
  high: { label: 'High', variant: 'destructive' },
};

export default function AnomalySeverityBadge({ severity, className }) {
  const config = SEVERITY_CONFIG[severity] ?? { label: severity ?? 'Unknown', variant: 'secondary' };

  return (
    <Badge variant={config.variant} className={cn('capitalize', className)}>
      {config.label}
    </Badge>
  );
}
