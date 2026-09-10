import { Card, CardContent } from '@/components/ui/card';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useResolveCategory } from '@/hooks/useResolveCategory';
import { pctChange } from '@/utils/pctChange';
import { Flame, TrendingDown, TrendingUp } from 'lucide-react';

export default function MonthOverview() {
  const { dashboard } = useAnalytics(true);
  const resolve = useResolveCategory();
  const d = dashboard ?? {};

  const incomeChg = pctChange(d.total_income, d.prev_income);
  const expenseChg = pctChange(d.total_expenses, d.prev_expenses);
  const topCat = d.top_category ? resolve(d.top_category).label : null;
  const hasData = d.total_income || d.total_expenses || d.prev_income || d.prev_expenses;

  if (!hasData) return null;

  return (
    <Card>
      <CardContent className="grid gap-4 py-4 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted">Income vs last month</p>
            <p className="text-sm font-medium">
              <CurrencyDisplay amount={d.total_income} />
              {incomeChg != null && <span className={incomeChg >= 0 ? 'text-success' : 'text-danger'}> ({incomeChg >= 0 ? '+' : ''}{incomeChg}%)</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-danger/10 text-danger">
            <TrendingDown className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted">Expenses vs last month</p>
            <p className="text-sm font-medium">
              <CurrencyDisplay amount={d.total_expenses} />
              {expenseChg != null && <span className={expenseChg <= 0 ? 'text-success' : 'text-danger'}> ({expenseChg >= 0 ? '+' : ''}{expenseChg}%)</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted">Daily burn · top category</p>
            <p className="text-sm font-medium">
              <CurrencyDisplay amount={d.daily_burn} />/day
              {topCat && <span className="text-muted"> · {topCat}</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
