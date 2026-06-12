import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import GoalProgressRing from '@/components/goals/GoalProgressRing';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

export default function GoalCard({ goal, onEdit, onDelete, onContribute, className }) {
  const current = goal.current_amount ?? 0;
  const target = goal.target_amount ?? 0;
  const remaining = Math.max(target - current, 0);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{goal.icon ?? '🎯'}</span>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{goal.name}</CardTitle>
              {current >= target && (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                  🎉 Completed
                </span>
              )}
            </div>
            <p className="text-xs text-muted">Target: {formatDate(goal.target_date)}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {onEdit && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(goal)}><Pencil className="h-4 w-4" /></Button>}
          {onDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => onDelete(goal)}><Trash2 className="h-4 w-4" /></Button>}
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <GoalProgressRing current={current} target={target} color={goal.color ?? '#06b6d4'} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm text-muted">Saved</p>
          <p className="text-xl font-semibold"><CurrencyDisplay amount={current} /></p>
          <p className="text-sm text-muted">
            of <CurrencyDisplay amount={target} /> · <CurrencyDisplay amount={remaining} /> left
          </p>
          {onContribute && (
            <Button size="sm" className="mt-2" onClick={() => onContribute(goal)}>Add contribution</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
