import PageHeader from '@/components/common/PageHeader';
import MonthSelector from '@/features/budgets/MonthSelector';
import BudgetSummaryStats from '@/features/budgets/BudgetSummaryStats';
import BudgetCardsGrid from '@/features/budgets/BudgetCardsGrid';
import BudgetSuggestions from '@/features/budgets/BudgetSuggestions';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useBudgets } from '@/hooks/useBudgets';
import { toastAsyncResult } from '@/utils/toastAsyncResult';
import { formatCurrency } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

export default function BudgetsPage() {
  const { items, month, year, create, fetch } = useBudgets();
  const confirm = useConfirm();
  const existingCategories = items.map((b) => b.category);

  const handleApplySuggestion = async (suggestion) => {
    const label = suggestion.category.replace('_', ' ');
    const ok = await confirm({
      title: 'Create budget from suggestion?',
      description: `Set ${label} limit to ${formatCurrency(suggestion.suggested_limit, undefined, false)}?`,
      confirmLabel: 'Create',
    });
    if (!ok) return;

    const r = await create({
      category: suggestion.category,
      monthly_limit: suggestion.suggested_limit,
      month,
      year,
    });
    if (toastAsyncResult(r, {
      success: `Budget created for ${label}`,
      error: 'Failed to create budget',
    })) {
      fetch();
    }
  };

  const handleApplyAll = async (suggestions) => {
    const ok = await confirm({
      title: 'Create all suggested budgets?',
      description: `Create ${suggestions.length} budgets from your spending history?`,
      confirmLabel: 'Create all',
    });
    if (!ok) return;

    let created = 0;
    for (const s of suggestions) {
      const r = await create({
        category: s.category,
        monthly_limit: s.suggested_limit,
        month,
        year,
      });
      if (toastAsyncResult(r, { error: `Failed to create ${s.category.replace('_', ' ')}` })) {
        created += 1;
      }
    }
    if (created > 0) {
      toast.success(`Created ${created} budget${created === 1 ? '' : 's'}`);
      fetch();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Track spending against your monthly limits."
        action={<MonthSelector />}
      />
      <BudgetSuggestions
        month={month}
        year={year}
        existingCategories={existingCategories}
        onApply={handleApplySuggestion}
        onApplyAll={handleApplyAll}
      />
      <BudgetSummaryStats />
      <BudgetCardsGrid />
    </div>
  );
}
