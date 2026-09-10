import { useEffect, useState } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import CategoryIcon from '@/components/transactions/CategoryIcon';
import budgetApi from '@/api/budgetApi';
import { useResolveCategory } from '@/hooks/useResolveCategory';

export default function BudgetSuggestions({
  month,
  year,
  existingCategories = [],
  onApply,
  onApplyAll,
}) {
  const resolve = useResolveCategory();
  const [suggestions, setSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applyingAll, setApplyingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    budgetApi
      .suggestions(month, year)
      .then((data) => {
        if (!cancelled) {
          setSuggestions(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year]);

  const filtered = suggestions
    .filter((s) => !existingCategories.includes(s.category))
    .slice(0, 6);

  if (dismissed || loading || !filtered.length) return null;

  const handleApplyAll = async () => {
    if (!onApplyAll || applyingAll) return;
    setApplyingAll(true);
    try {
      await onApplyAll(filtered);
    } finally {
      setApplyingAll(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm font-medium text-foreground">Smart Budget Suggestions</p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-muted hover:text-foreground"
            aria-label="Dismiss suggestions"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted">
            Based on your last 3 months of spending. Click a chip to create one budget.
          </p>
          {onApplyAll && (
            <Button
              size="sm"
              variant="outline"
              disabled={applyingAll}
              onClick={handleApplyAll}
              className="shrink-0"
            >
              {applyingAll ? 'Creating…' : 'Create all suggested'}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {filtered.map((s) => {
            const cat = resolve(s.category);
            return (
              <button
                key={s.category}
                type="button"
                onClick={() => onApply?.(s)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface-1 px-3 py-1.5 text-xs transition-all hover:border-primary hover:bg-primary/10"
              >
                <CategoryIcon categoryId={s.category} size="sm" showBackground={false} />
                <span className="font-medium">{cat.label}</span>
                <span className="text-muted">·</span>
                <span className="font-semibold tabular-nums text-primary">
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
