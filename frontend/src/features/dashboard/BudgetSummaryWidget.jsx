import { Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { useBudgets } from '@/hooks/useBudgets';
import { getCategoryById } from '@/constants/categories';
import { ROUTES } from '@/constants/routes';
import { getUtilizationColor } from '@/utils/budgetPace';

export default function BudgetSummaryWidget() {
  const { items, loading } = useBudgets();

  const top = [...items].sort((a, b) => (b.utilization_pct ?? 0) - (a.utilization_pct ?? 0)).slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Top budgets</CardTitle>
        {items.length > 0 && (
          <Link to={ROUTES.BUDGETS} className="text-sm text-primary hover:underline">View all</Link>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
              <PiggyBank className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">No budgets yet</p>
            <p className="mt-1 max-w-[200px] text-xs text-muted">
              Set spending limits to track where your money goes each month.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to={ROUTES.BUDGETS}>Create a budget</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {top.map((b) => {
              const pct = Math.min(b.utilization_pct ?? 0, 100);
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{getCategoryById(b.category)?.label ?? b.category}</span>
                    <span className="text-muted tabular-nums">{Math.round(pct)}%</span>
                  </div>
                  <Progress value={pct} className="mt-1.5" style={{ '--progress-color': getUtilizationColor(pct) }} />
                  <p className="mt-1 text-xs text-muted">
                    <CurrencyDisplay amount={b.spent ?? 0} /> of <CurrencyDisplay amount={b.monthly_limit} />
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
