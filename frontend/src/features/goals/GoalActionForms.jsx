import { useState } from 'react';
import { addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toISODateString } from '@/utils/formatDate';

const GOALS_ACCOUNT_NAME = 'Goal savings';

function spendableAccounts(accounts) {
  return accounts.filter((a) => a.name !== GOALS_ACCOUNT_NAME);
}

/** Move money from an account into a goal. */
export function ContributeForm({ accounts, onSubmit, onCancel }) {
  const spendable = spendableAccounts(accounts);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => toISODateString(new Date()));
  const [accountId, setAccountId] = useState('');
  const selectedAccountId = accountId || spendable[0]?.id || '';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ amount: parseFloat(amount), date, account_id: selectedAccountId });
      }}
      className="space-y-4"
    >
      <p className="text-xs text-muted">
        Transfers money from the selected account into your Goal savings jar.
      </p>
      <div>
        <Label>From account</Label>
        <Select value={selectedAccountId} onValueChange={setAccountId}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select account" /></SelectTrigger>
          <SelectContent>
            {spendable.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Amount</Label>
        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" required />
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" required />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!selectedAccountId}>Add funds</Button>
      </div>
    </form>
  );
}

/** Move goal savings back to an account and close the goal. */
export function WithdrawForm({ accounts, onSubmit, onCancel }) {
  const spendable = spendableAccounts(accounts);
  const [accountId, setAccountId] = useState('');
  const selectedAccountId = accountId || spendable[0]?.id || '';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ account_id: selectedAccountId });
      }}
      className="space-y-4"
    >
      <p className="text-sm text-muted">
        Move the saved amount back into an account and close this goal.
      </p>
      <div>
        <Label>To account</Label>
        <Select value={selectedAccountId} onValueChange={setAccountId}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select account" /></SelectTrigger>
          <SelectContent>
            {spendable.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!selectedAccountId}>Withdraw</Button>
      </div>
    </form>
  );
}

/** Roll a completed goal balance into a new goal. */
export function ConvertForm({ goal, onSubmit, onCancel }) {
  const [name, setName] = useState(`${goal.name} (next)`);
  const [target, setTarget] = useState(String(goal.target_amount ?? ''));
  const [date, setDate] = useState(() => toISODateString(addDays(new Date(), 90)));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: name.trim(),
          target_amount: parseFloat(target),
          target_date: date,
          icon: goal.icon,
          color: goal.color,
        });
      }}
      className="space-y-4"
    >
      <p className="text-sm text-muted">
        Carry your saved balance into a new goal and mark this one complete.
      </p>
      <div>
        <Label>New goal name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" required />
      </div>
      <div>
        <Label>New target</Label>
        <Input type="number" step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1.5" required />
      </div>
      <div>
        <Label>Target date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" required />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Convert</Button>
      </div>
    </form>
  );
}
