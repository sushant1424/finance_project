import PageHeader from '@/components/common/PageHeader';
import MonthSelector from '@/features/budgets/MonthSelector';
import BudgetSummaryStats from '@/features/budgets/BudgetSummaryStats';
import BudgetCardsGrid from '@/features/budgets/BudgetCardsGrid';

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Budgets" description="Track spending against your monthly limits." action={<MonthSelector />} />
      <BudgetSummaryStats />
      <BudgetCardsGrid />
    </div>
  );
}
