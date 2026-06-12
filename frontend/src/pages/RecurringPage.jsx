import { useEffect, useState } from 'react';
import { RefreshCw, Calendar, Sparkles, CreditCard, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCategoryById } from '@/constants/categories';
import CategoryIcon from '@/components/transactions/CategoryIcon';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import transactionApi from '@/api/transactionApi';
import { formatDate } from '@/utils/formatDate';

export default function RecurringPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionApi.recurring()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalMonthlySpend = items.reduce((acc, item) => acc + item.avg_amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Recurring Transactions" description="Subscriptions and recurring payments auto-detected from your transaction history." />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurring Transactions"
        description="Subscriptions and recurring payments auto-detected from your transaction history."
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted">Est. Monthly Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              <CurrencyDisplay amount={totalMonthlySpend} />
            </div>
            <p className="mt-1 text-xs text-muted">Across all detected cycles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted">Active Recurring Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{items.length}</div>
            <p className="mt-1 text-xs text-muted">Appearing 2+ months in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted">Avg. Cost / Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              <CurrencyDisplay amount={items.length ? totalMonthlySpend / items.length : 0} />
            </div>
            <p className="mt-1 text-xs text-muted">Average amount per item</p>
          </CardContent>
        </Card>
      </div>

      {/* List Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Detected Subscriptions & Recurring Bills
          </CardTitle>
          <span className="text-xs text-muted">Smart detection active</span>
        </CardHeader>
        <CardContent>
          {!items.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-surface-2 p-3 text-muted">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No recurring transactions found</h3>
              <p className="mt-1 text-sm text-muted">
                Keep tracking your spending. Once transactions with the same name span 2 or more months, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item, idx) => {
                const cat = getCategoryById(item.category);
                return (
                  <div key={idx} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <CategoryIcon categoryId={item.category} size="lg" />
                      <div>
                        <h4 className="font-semibold text-foreground">{item.description}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                          <span className="capitalize">{item.category.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{item.months_seen} billing cycles</span>
                          <span>•</span>
                          <span>Last payment {formatDate(item.last_date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <span className="text-base font-bold text-foreground">
                          <CurrencyDisplay amount={item.avg_amount} />
                        </span>
                        <span className="ml-1 text-xs text-muted">/ mo</span>
                        <div className="text-[10px] text-muted">
                          {item.count} total payments
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
