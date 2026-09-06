import { Pencil, Trash2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import GoalProgressRing from '@/components/goals/GoalProgressRing';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onContribute,
  onComplete,
  onWithdraw,
  onConvert,
  className,
}) {
  const current = goal.current_amount ?? 0;
  const target = goal.target_amount ?? 0;
  const remaining = Math.max(target - current, 0);
  const achieved = current >= target || goal.status === 'achieved';
  const closed = goal.goal_status === 'completed' || goal.goal_status === 'withdrawn';
  const monthlyNeeded = goal.monthly_needed ?? 0;

  return (
    <Card className={cn('overflow-hidden', achieved && !closed && 'ring-1 ring-success/40', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{goal.icon ?? '🎯'}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{goal.name}</CardTitle>
              {achieved && !closed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                  <PartyPopper className="h-3 w-3" /> Goal reached!
                </span>
              )}
              {goal.goal_status === 'completed' && (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                  Completed
                </span>
              )}
              {goal.goal_status === 'withdrawn' && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted">
                  Withdrawn
                </span>
              )}
            </div>
            <p className="text-xs text-muted">Target: {formatDate(goal.target_date)}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {onEdit && !closed && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(goal)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => onDelete(goal)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <GoalProgressRing current={current} target={target} color={goal.color ?? '#06b6d4'} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm text-muted">Saved</p>
          <p className="text-xl font-semibold"><CurrencyDisplay amount={current} /></p>
          <p className="text-sm text-muted">
            of <CurrencyDisplay amount={target} />
            {!achieved && (
              <> · <CurrencyDisplay amount={remaining} /> left</>
            )}
          </p>
          {!achieved && !closed && monthlyNeeded > 0 && (
            <p className="text-xs font-medium text-primary">
              Save <CurrencyDisplay amount={monthlyNeeded} />/month to hit this on time
            </p>
          )}
          {achieved && !closed && (
            <p className="text-xs font-medium text-success">You hit 100% — celebrate, then withdraw or convert.</p>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            {!closed && !achieved && onContribute && (
              <Button size="sm" onClick={() => onContribute(goal)}>Add contribution</Button>
            )}
            {achieved && !closed && onComplete && goal.goal_status === 'active' && (
              <Button size="sm" variant="outline" onClick={() => onComplete(goal)}>Mark done</Button>
            )}
            {(achieved || goal.goal_status === 'completed') && goal.goal_status !== 'withdrawn' && current > 0 && onWithdraw && (
              <Button size="sm" variant="outline" onClick={() => onWithdraw(goal)}>Withdraw</Button>
            )}
            {(achieved || goal.goal_status === 'completed') && current > 0 && onConvert && (
              <Button size="sm" onClick={() => onConvert(goal)}>Convert to new goal</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
