import PageHeader from '@/components/common/PageHeader';
import AccountsSettings from '@/features/settings/AccountsSettings';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function AccountsPage() {
  const { accounts } = useAccounts();
  const { currency, showCents } = useAuth();
  const netWorth = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts"
        description="Manage your cash, bank, and credit accounts."
      />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Total net worth</CardTitle>
          <p className="text-xs text-muted">Sum of all account balances (debts included as negatives).</p>
        </CardHeader>
        <CardContent>
          <CurrencyDisplay
            amount={netWorth}
            currency={currency}
            showCents={showCents}
            className={cn(
              'text-2xl font-semibold tabular-nums',
              netWorth < 0 ? 'text-danger' : 'text-primary',
            )}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your accounts</CardTitle>
          <p className="text-xs text-muted">Tap an account for its history. Add or remove below.</p>
        </CardHeader>
        <CardContent>
          <AccountsSettings />
        </CardContent>
      </Card>
    </div>
  );
}
