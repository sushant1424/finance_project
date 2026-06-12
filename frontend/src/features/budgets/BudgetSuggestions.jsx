import { useEffect, useState } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import budgetApi from '@/api/budgetApi';
import { getCategoryById } from '@/constants/categories';

export default function BudgetSuggestions({ month, year, existingCategories = [], onApply }) {
  const [suggestions, setSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    budgetApi.suggestions(month, year).then((data) => {
      setSuggestions(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [month, year]);

  // Only show suggestions for categories without an existing budget
  const filtered = suggestions.filter((s) => !existingCategories.includes(s.category));

  if (dismissed || loading || !filtered.length) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-medium text-foreground">Smart Budget Suggestions</p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted mb-3">Based on your last 3 months of spending. Click to create a budget.</p>
        <div className="flex flex-wrap gap-2">
          {filtered.slice(0, 6).map((s) => {
            const cat = getCategoryById(s.category);
            return (
              <button
                key={s.category}
                onClick={() => onApply?.(s)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface-1 px-3 py-1.5 text-xs hover:border-primary hover:bg-primary/10 transition-all"
              >
                <span>{cat?.icon ?? '📁'}</span>
                <span className="font-medium capitalize">{s.category.replace('_', ' ')}</span>
                <span className="text-muted">·</span>
                <span className="text-primary font-semibold tabular-nums">
                  <CurrencyDisplay amount={s.suggested_limit} />
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
