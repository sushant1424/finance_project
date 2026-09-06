import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'credit_card', label: 'Credit card' },
];

export default function AccountsSettings() {
  const { accounts, fetch, create, setDefault, remove } = useAccounts();
  const { currency, showCents } = useAuth();
  const confirm = useConfirm();
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [openingBalance, setOpeningBalance] = useState('0');

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      await create({
        name: name.trim(),
        type,
        opening_balance: Number(openingBalance) || 0,
      });
      setName('');
      setOpeningBalance('0');
      setType('cash');
      fetch();
      toast.success('Account added');
    } catch {
      toast.error('Could not add account');
    }
  };

  const handleSetDefault = async (account) => {
    if (account.is_default) return;
    try {
      await setDefault(account.id);
      fetch();
      toast.success(`${account.name} is now the default account`);
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Could not set default');
    }
  };

  const handleDelete = async (account) => {
    if (account.is_default) return;
    const ok = await confirm({
      title: 'Delete account?',
      description: 'Transactions will move to your default account.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;
    try {
      await remove(account.id);
      fetch();
      toast.success('Account deleted');
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Could not delete');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        New transactions from the dashboard and Transactions page go to the default account.
        Open an account to log spending there instead.
      </p>
      <ul className="space-y-2">
        {accounts.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
            <Link
              to={`${ROUTES.ACCOUNTS}/${a.id}`}
              className="min-w-0 flex-1 hover:opacity-80"
            >
              <p className="text-sm font-medium">{a.name}</p>
              <p className="text-xs text-muted capitalize">
                {a.type.replace('_', ' ')}
                {a.is_default ? ' · default' : ''}
              </p>
            </Link>
            <CurrencyDisplay
              amount={a.balance}
              currency={currency}
              showCents={showCents}
              className={cn(
                'shrink-0 text-sm font-semibold tabular-nums',
                a.balance < 0 ? 'text-danger' : 'text-primary',
              )}
            />
            {!a.is_default && a.name !== 'Goal savings' && (
              <Button
                variant="ghost"
                size="icon"
                  title="Set as default"
                  onClick={() => handleSetDefault(a)}
                  className="text-muted hover:text-primary"
                >
                  <Star className="h-4 w-4" />
                  <span className="sr-only">Set as default</span>
                </Button>
            )}
            {a.is_default && (
              <span title="Default account" className="flex h-9 w-9 items-center justify-center text-primary">
                <Star className="h-4 w-4 fill-current" />
              </span>
            )}
            {!a.is_default && a.name !== 'Goal savings' && (
              <Button variant="ghost" size="icon" onClick={() => handleDelete(a)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
        <div className="min-w-[140px] flex-1">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Personal" className="mt-1" />
        </div>
        <div className="w-[130px]">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[130px]">
          <Label>Opening balance</Label>
          <Input
            type="number"
            step="0.01"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button onClick={handleAdd}><Plus className="h-4 w-4" />Add</Button>
      </div>
    </div>
  );
}
