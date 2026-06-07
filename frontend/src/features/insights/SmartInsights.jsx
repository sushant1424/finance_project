import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SkeletonCard from '@/components/common/SkeletonCard';
import { useSelector } from 'react-redux';
import { Lightbulb, Repeat } from 'lucide-react';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';

export default function SmartInsights() {
  const data = useSelector((s) => s.analytics.insights);

  if (!data) return <SkeletonCard className="h-[320px]" />;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4 text-warning" />
          Smart Insights
        </CardTitle>
        <p className="text-xs text-muted">Actionable tips from your actual spending patterns</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.tips?.length ? data.tips.map((tip) => (
          <p key={tip} className="rounded-lg border border-border bg-surface-2/50 px-3 py-2.5 text-sm leading-relaxed text-foreground">{tip}</p>
        )) : (
          <p className="text-sm text-muted">Add more transactions to unlock personalized insights.</p>
        )}
        {data.recurring_expenses?.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
              <Repeat className="h-3 w-3" /> Recurring charges
            </p>
            <div className="space-y-2">
              {data.recurring_expenses.map((r) => (
                <div key={r.description} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-foreground">{r.description}</span>
                  <span className="shrink-0 text-muted">
                    <CurrencyDisplay amount={r.avg_amount} /> · {r.count}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
