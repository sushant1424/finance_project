import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/common/EmptyState';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatDate';
import { getCategoryById } from '@/constants/categories';
import { ROUTES } from '@/constants/routes';
import { ArrowLeftRight } from 'lucide-react';

export default function RecentTransactions() {
  const { dashboard } = useAnalytics(true);
  const { currency, showCents, user } = useAuth();
  const navigate = useNavigate();
  const items = dashboard?.recent_transactions ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Link to={ROUTES.TRANSACTIONS} className="text-sm text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions yet"
            description="Add your first transaction to start tracking your finances."
            actionLabel="Add transaction"
            onAction={() => navigate(ROUTES.TRANSACTIONS)}
          />
        ) : (
          <ul className="divide-y divide-border">
            {items.slice(0, 8).map((tx) => (
              <li key={tx.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted">
                    {getCategoryById(tx.category)?.label ?? tx.category} · {formatDate(tx.date, user?.date_format)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {tx.is_anomaly && <Badge variant="destructive">Anomaly</Badge>}
                  <span className={tx.type === 'income' ? 'text-success' : 'text-danger'}>
                    <CurrencyDisplay amount={tx.amount} currency={currency} showCents={showCents} />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
