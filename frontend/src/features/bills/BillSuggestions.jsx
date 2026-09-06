import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { FREQUENCY_LABELS } from '@/constants/recurring';

/** Suggested recurring patterns from transaction history. */
export default function BillSuggestions({ suggestions, onAdopt }) {
  if (!suggestions.length) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-4">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm font-medium text-foreground">Suggested from your history</p>
        </div>
        <p className="mb-3 text-xs text-muted">
          Patterns that look recurring. Tap to track as a bill.
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={`${s.description}-${s.frequency}`}
              type="button"
              onClick={() => onAdopt(s)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs transition-colors hover:border-primary hover:bg-primary/10"
            >
              <span className="max-w-[140px] truncate font-medium">{s.description}</span>
              <span className="text-muted">·</span>
              <span className="font-semibold tabular-nums text-primary">
                <CurrencyDisplay amount={s.amount} />
              </span>
              <span className="text-muted">
                /{FREQUENCY_LABELS[s.frequency] ?? s.frequency}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
