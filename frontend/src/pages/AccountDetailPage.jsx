import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import Pagination from '@/components/common/Pagination';
import TransactionTable from '@/components/transactions/TransactionTable';
import AddTransactionDialog from '@/features/transactions/AddTransactionDialog';
import accountApi from '@/api/accountApi';
import transactionApi from '@/api/transactionApi';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const TYPE_LABELS = { cash: 'Cash', bank: 'Bank', credit_card: 'Credit card' };
const LIMIT = 20;

function AccountDetailInner({ accountId }) {
  const { currency, showCents } = useAuth();
  const [page, setPage] = useState(1);
  const [account, setAccount] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [acct, txs] = await Promise.all([
        accountApi.get(accountId),
        transactionApi.list({
          account_id: accountId,
          page,
          limit: LIMIT,
          sort_by: 'date',
          sort_order: 'desc',
        }),
      ]);
      setAccount(acct);
      setItems(txs.items ?? []);
      setTotal(txs.total ?? 0);
      setError(false);
    } catch {
      setAccount(null);
      setItems([]);
      setTotal(0);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [accountId, page]);

  useEffect(() => {
    load();
  }, [load]);

  if (!loading && (error || !account)) {
    return (
      <div className="space-y-4">
        <Link to={ROUTES.ACCOUNTS} className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to accounts
        </Link>
        <p className="text-sm text-muted">Account not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to={ROUTES.ACCOUNTS} className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to accounts
      </Link>
      <PageHeader
        title={account?.name ?? 'Account'}
        description={
          account
            ? `${TYPE_LABELS[account.type] ?? account.type}${account.is_default ? ' · default' : ''}`
            : undefined
        }
        action={
          <AddTransactionDialog
            defaultValues={{ account_id: accountId }}
            lockAccount
            onSuccess={load}
          />
        }
      />
      {account && (
        <div className="rounded-xl border border-border px-4 py-3">
          <p className="text-xs text-muted">Balance</p>
          <CurrencyDisplay
            amount={account.balance}
            currency={currency}
            showCents={showCents}
            className={cn(
              'text-2xl font-semibold tabular-nums',
              account.balance < 0 ? 'text-danger' : 'text-primary',
            )}
          />
        </div>
      )}
      <TransactionTable
        transactions={items}
        loading={loading}
        relativeAccountId={accountId}
      />
      {total > LIMIT && (
        <Pagination
          page={page}
          pageSize={LIMIT}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default function AccountDetailPage() {
  const { accountId } = useParams();
  // Remount when switching accounts so page/state reset cleanly
  return <AccountDetailInner key={accountId} accountId={accountId} />;
}
