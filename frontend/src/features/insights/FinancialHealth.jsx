import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScoreRing from '@/components/common/ScoreRing';
import SkeletonCard from '@/components/common/SkeletonCard';
import { useSelector } from 'react-redux';
import { Activity, Calendar, Target, AlertTriangle } from 'lucide-react';

export default function FinancialHealth() {
  const data = useSelector((s) => s.analytics.insights);

  if (!data) return <SkeletonCard className="h-[220px]" />;

  const metrics = [
    { icon: Activity, label: 'Savings rate', value: `${data.savings_rate}%` },
    { icon: Calendar, label: 'Spend runway', value: data.runway_days > 0 ? `${data.runway_days} days` : '—' },
    { icon: Target, label: 'Goal progress', value: `${data.goal_progress_avg}%` },
    { icon: AlertTriangle, label: 'Budgets at risk', value: data.budgets_at_risk ?? 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Financial Health Score</CardTitle>
        <p className="text-xs text-muted">Blends savings rate, budget discipline, goal progress, and anomaly history</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={data.health_score} grade={data.health_grade} />
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          {metrics.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-muted"><Icon className="h-3.5 w-3.5" />{label}</span>
              <span className="font-medium tabular-nums text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
