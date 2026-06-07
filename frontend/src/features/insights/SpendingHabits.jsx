import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DayOfWeekBar from '@/components/charts/DayOfWeekBar';
import SkeletonCard from '@/components/common/SkeletonCard';
import { useSelector } from 'react-redux';
import { DEFAULT_CHART_HEIGHT } from '@/constants/chartConfig';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';

export default function SpendingHabits() {
  const data = useSelector((s) => s.analytics.insights);

  if (!data) return <SkeletonCard className="h-[320px]" />;

  const top = data.top_spending_day;
  const quiet = data.quietest_day;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Spending by day</CardTitle>
        <p className="text-xs text-muted">Last 90 days of expenses</p>
      </CardHeader>
      <CardContent>
        {top?.day && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-surface-2/50 px-3 py-2">
              <p className="text-xs text-muted">Highest</p>
              <p className="text-sm font-medium text-foreground">{top.day}</p>
              <CurrencyDisplay amount={top.amount} className="text-xs text-expense" />
            </div>
            <div className="rounded-lg border border-border bg-surface-2/50 px-3 py-2">
              <p className="text-xs text-muted">Lowest</p>
              <p className="text-sm font-medium text-foreground">{quiet?.day}</p>
              <CurrencyDisplay amount={quiet?.amount ?? 0} className="text-xs text-muted" />
            </div>
          </div>
        )}
        <DayOfWeekBar data={data.day_of_week} height={DEFAULT_CHART_HEIGHT - 60} />
      </CardContent>
    </Card>
  );
}
