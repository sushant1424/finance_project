import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import CategoryIcon from '@/components/transactions/CategoryIcon';
import BudgetPaceIndicator from '@/components/budget/BudgetPaceIndicator';
import BudgetProgressBar from '@/components/budget/BudgetProgressBar';
import { getCategoryById } from '@/constants/categories';
import { normalizePace } from '@/utils/budgetPace';
import { cn } from '@/lib/utils';

export default function BudgetCard({ budget, onEdit, onDelete, className }) {
  const category = getCategoryById(budget.category);
  const spent = budget.spent ?? budget.amount_spent ?? 0;
  const limit = budget.monthly_limit ?? 0;
  const pace = normalizePace(budget.pace);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <CategoryIcon categoryId={budget.category} />
          <div>
            <CardTitle className="text-base">{category?.label ?? budget.category}</CardTitle>
            <p className="text-sm text-muted">
              <CurrencyDisplay amount={spent} /> / <CurrencyDisplay amount={limit} />
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {onEdit && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(budget)}><Pencil className="h-4 w-4" /></Button>}
          {onDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => onDelete(budget)}><Trash2 className="h-4 w-4" /></Button>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <BudgetProgressBar spent={spent} limit={limit} />
        <BudgetPaceIndicator pace={pace} />
      </CardContent>
    </Card>
  );
}
