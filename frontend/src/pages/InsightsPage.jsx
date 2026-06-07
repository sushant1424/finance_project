import PageHeader from '@/components/common/PageHeader';
import InsightsLoader from '@/features/insights/InsightsLoader';
import FinancialHealth from '@/features/insights/FinancialHealth';
import SmartInsights from '@/features/insights/SmartInsights';
import SpendingHabits from '@/features/insights/SpendingHabits';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <InsightsLoader />
      <PageHeader
        title="Insights"
        description="Personalized analysis from your spending, budgets, and goals."
      />
      <FinancialHealth />
      <div className="grid gap-6 lg:grid-cols-2">
        <SmartInsights />
        <SpendingHabits />
      </div>
    </div>
  );
}
