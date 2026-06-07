import StatCard from '@/components/common/StatCard';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { TrendingUp, TrendingDown, PiggyBank, Percent } from 'lucide-react';

export default function ReportsSummary({ monthly = [] }) {
  const income = monthly.reduce((s, m) => s + (m.income ?? 0), 0);
  const expenses = monthly.reduce((s, m) => s + (m.expenses ?? 0), 0);
  const savings = income - expenses;
  const rate = income > 0 ? Math.round((savings / income) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total income" value={<CurrencyDisplay amount={income} />} icon={TrendingUp} />
      <StatCard title="Total expenses" value={<CurrencyDisplay amount={expenses} />} icon={TrendingDown} />
      <StatCard title="Net savings" value={<CurrencyDisplay amount={savings} />} icon={PiggyBank} />
      <StatCard title="Savings rate" value={`${rate}%`} icon={Percent} />
    </div>
  );
}
