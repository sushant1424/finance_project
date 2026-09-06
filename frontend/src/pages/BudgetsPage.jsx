import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import MonthSelector from '@/features/budgets/MonthSelector';
import BudgetSummaryStats from '@/features/budgets/BudgetSummaryStats';
import BudgetCardsGrid from '@/features/budgets/BudgetCardsGrid';
import BudgetSuggestions from '@/features/budgets/BudgetSuggestions';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useBudgets } from '@/hooks/useBudgets';
import { toastAsyncResult } from '@/utils/toastAsyncResult';
import { Button } from '@/components/ui/button';

export default function BudgetsPage() {
  const { items, month, year, create, fetch } = useBudgets();
  const [pendingSuggestion, setPendingSuggestion] = useState(null);
  const gridRef = useRef(null);
  const confirm = useConfirm();

  const existingCategories = items.map((b) => b.category);

  const handleApplySuggestion = async (suggestion) => {
    const ok = await confirm({
      title: 'Create budget from suggestion?',
      description: `Set ${suggestion.category.replace('_', ' ')} limit to NPR ${suggestion.suggested_limit}?`,
      confirmLabel: 'Create',
    });
    if (!ok) return;
    const data = {
      category: suggestion.category,
      monthly_limit: suggestion.suggested_limit,
      month,
      year,
    };
    const r = await create(data);
    if (toastAsyncResult(r, {
      success: `Budget created for ${suggestion.category.replace('_', ' ')}`,
      error: 'Failed to create budget',
    })) {
      fetch();
    }
  };

  const handleExportCsv = async () => {
    const ok = await confirm({
      title: 'Export budgets?',
      description: 'Download this month\'s budgets as CSV.',
      confirmLabel: 'Export',
    });
    if (!ok) return;
    const headers = ['Category', 'Monthly Limit', 'Spent', 'Remaining', 'Utilization %', 'Status'];
    const rows = items.map((b) => [
      b.category,
      b.monthly_limit,
      b.spent,
      b.remaining,
      b.utilization_pct,
      b.pace?.status ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgets-${year}-${String(month).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Budget CSV downloaded');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Track spending against your monthly limits."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4" />Export CSV
            </Button>
            <MonthSelector />
          </div>
        }
      />
      <BudgetSuggestions
        month={month}
        year={year}
        existingCategories={existingCategories}
        onApply={handleApplySuggestion}
      />
      <BudgetSummaryStats />
      <BudgetCardsGrid />
    </div>
  );
}
