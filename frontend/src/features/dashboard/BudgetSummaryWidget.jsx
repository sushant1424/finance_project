import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { useBudgets } from '@/hooks/useBudgets';
import { getCategoryById } from '@/constants/categories';
import { ROUTES } from '@/constants/routes';
import { getUtilizationColor } from '@/utils/budgetPace';

export default function BudgetSummaryWidget() {
  const { items, loading } = useBudgets();

  if (loading || !items.length) return null;

  const top = [...items].sort((a, b) => (b.utilization_pct ?? 0) - (a.utilization_pct ?? 0)).slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Top budgets</CardTitle>
        <Link to={ROUTES.BUDGETS} className="text-sm text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
