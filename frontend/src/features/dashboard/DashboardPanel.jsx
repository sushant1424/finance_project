import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Shared shell so dashboard tiles match size and spacing. */
export default function DashboardPanel({ title, to, actionLabel, children, className, minHeight }) {
  return (
    <Card className={cn('flex h-full flex-col', minHeight, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 pb-3 pt-5">
        <CardTitle className="text-sm font-medium text-muted">{title}</CardTitle>
        {to && (
          <Link to={to} className="text-xs text-primary hover:underline">
            {actionLabel ?? 'View →'}
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-5 pb-5 pt-0">{children}</CardContent>
    </Card>
  );
}
