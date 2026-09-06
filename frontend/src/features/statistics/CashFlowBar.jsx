import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';

export default function CashFlowBar({ income = 0, expenses = 0, className }) {
  const savings = Math.max(0, income - expenses);
  const expensePct = income > 0 ? Math.min(100, (expenses / income) * 100) : 0;
  const savingsPct = income > 0 ? Math.max(0, 100 - expensePct) : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">This month</CardTitle>
        <p className="text-xs text-muted">
          How your income compares to spending.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipeline Bar */}
        <div className="space-y-1.5">
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-surface-2">
            {income > 0 ? (
              <>
                <div
                  style={{ width: `${expensePct}%` }}
                  className="h-full bg-danger/80 transition-all"
                  title={`Expenses: ${expensePct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${savingsPct}%` }}
                  className="h-full bg-success/80 transition-all"
                  title={`Savings: ${savingsPct.toFixed(1)}%`}
                />
              </>
            ) : (
              <div className="h-full w-full bg-surface-2 text-center text-[10px] text-muted flex items-center justify-center">
                No income recorded for this period
              </div>
            )}
          </div>
        </div>

        {/* 3 Step Flow Details */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-border bg-surface-2/40 p-2.5">
            <p className="text-muted text-[11px]">Total Income</p>
            <p className="font-semibold text-foreground mt-0.5"><CurrencyDisplay amount={income} /></p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2/40 p-2.5">
            <p className="text-muted text-[11px]">Expenses ({expensePct.toFixed(0)}%)</p>
            <p className="font-semibold text-expense mt-0.5"><CurrencyDisplay amount={expenses} /></p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2/40 p-2.5">
            <p className="text-muted text-[11px]">Net Saved ({savingsPct.toFixed(0)}%)</p>
            <p className="font-semibold text-success mt-0.5"><CurrencyDisplay amount={savings} /></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
