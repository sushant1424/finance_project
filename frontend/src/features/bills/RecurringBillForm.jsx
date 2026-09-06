import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { FREQUENCIES } from '@/constants/recurring';
import { useCategories } from '@/hooks/useCategories';

export default function RecurringBillForm({ defaultValues, onSubmit, onCancel, isSubmitting = false }) {
  const { custom } = useCategories();
  const [type, setType] = useState(defaultValues?.type ?? 'expense');
  const [description, setDescription] = useState(defaultValues?.description ?? '');
  const [amount, setAmount] = useState(defaultValues?.amount ?? '');
  const [category, setCategory] = useState(defaultValues?.category ?? 'food');
  const [frequency, setFrequency] = useState(defaultValues?.frequency ?? 'monthly');
  const [dueDay, setDueDay] = useState(defaultValues?.due_day ?? '');
  const [notes, setNotes] = useState(defaultValues?.notes ?? '');

  const baseCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const customForType = custom.map((c) => ({
    id: c.name.toLowerCase().replace(/\s+/g, '_'),
    label: c.name,
  }));
  const allCategories = [...baseCategories, ...customForType];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type,
      description: description.trim(),
      amount: Number(amount),
      category,
      frequency,
      due_day: dueDay ? Number(dueDay) : null,
      notes: notes.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense (bill)</SelectItem>
              <SelectItem value="income">Income (salary, etc.)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bill-amount">Amount</Label>
          <Input
            id="bill-amount"
            type="number"
            step="0.01"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bill-desc">Description</Label>
        <Input
          id="bill-desc"
          required
          maxLength={100}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {allCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bill-due">Due day of month (optional)</Label>
        <Input
          id="bill-due"
          type="number"
          min="1"
          max="31"
          placeholder="e.g. 15"
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bill-notes">Notes (optional)</Label>
        <Input id="bill-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
