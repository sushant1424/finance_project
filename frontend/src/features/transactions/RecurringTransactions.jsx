import { useEffect, useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryById } from '@/constants/categories';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import transactionApi from '@/api/transactionApi';

export default function RecurringTransactions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    transactionApi.recurring().then((data) => {
      setItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" />Recurring Transactions</CardTitle></CardHeader>
        <CardContent><div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-2" />)}</div></CardContent>
      </Card>
    );
  }

  if (!items.length) return null;

  const visible = expanded ? items : items.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-primary" />
          Recurring Transactions
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{items.length}</span>
        </CardTitle>
        <p className="text-xs text-muted">Auto-detected from history</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {visible.map((item, i) => {
            const cat = getCategoryById(item.category);
            return (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-surface-1 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat?.icon ?? '💳'}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.description}</p>
                    <p className="text-xs text-muted capitalize">{item.category.replace('_', ' ')} · {item.months_seen} months</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    <CurrencyDisplay amount={item.avg_amount} />
                  </p>
                  <p className="text-xs text-muted">avg/month</p>
                </div>
              </div>
            );
          })}
        </div>
        {items.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
          >
            {expanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show {items.length - 5} more</>}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
