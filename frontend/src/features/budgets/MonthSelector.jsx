import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBudgets } from '@/hooks/useBudgets';
import { formatMonthYear } from '@/utils/formatDate';

export default function MonthSelector() {
  const { month, year, setMonthYear } = useBudgets(false);

  const shift = (delta) => {
    const d = new Date(year, month - 1 + delta, 1);
    setMonthYear(d.getMonth() + 1, d.getFullYear());
  };

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></Button>
      <span className="min-w-[140px] text-center font-medium">{formatMonthYear(month, year)}</span>
      <Button variant="outline" size="icon" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></Button>
    </div>
  );
}
