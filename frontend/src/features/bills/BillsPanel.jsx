import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, Trash2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoryIcon from '@/components/transactions/CategoryIcon';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import Pagination from '@/components/common/Pagination';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useHasTransactions } from '@/hooks/useHasTransactions';
import recurringBillApi from '@/api/recurringBillApi';
import { FREQUENCY_LABELS } from '@/constants/recurring';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import RecurringBillForm from '@/features/bills/RecurringBillForm';

const PAGE_SIZE = 8;

export default function BillsPanel() {
  const confirm = useConfirm();
  const { hasTransactions } = useHasTransactions();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({ total_monthly: 0, count: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadBills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recurringBillApi.list({ page, limit: PAGE_SIZE });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setSummary(data.summary ?? { total_monthly: 0, count: data.total ?? 0 });
    } catch {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await recurringBillApi.create(data);
      toast.success('Bill added');
      setFormOpen(false);
      setPage(1);
      await loadBills();
    } catch {
      toast.error('Failed to add bill');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await recurringBillApi.update(editBill.id, data);
      toast.success('Bill updated');
      setEditBill(null);
      await loadBills();
    } catch {
      toast.error('Failed to update bill');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bill) => {
    const ok = await confirm({
      title: 'Remove bill?',
      description: `Stop tracking "${bill.description}"?`,
      confirmLabel: 'Remove',
      variant: 'destructive',
    });
    if (!ok) return;
    try {
      await recurringBillApi.remove(bill.id);
      toast.success('Bill removed');
      await loadBills();
    } catch {
      toast.error('Failed to remove bill');
    }
  };

  const handlePay = async (bill) => {
    try {
      await recurringBillApi.recordPayment(bill.id);
      toast.success('Payment recorded');
      await loadBills();
    } catch {
      toast.error('Failed to record payment');
    }
  };

  if (loading && !items.length) {
    return <div className="h-48 animate-pulse rounded-xl bg-surface-2" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Est. monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                <CurrencyDisplay amount={summary.total_monthly} />
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Active bills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{summary.count}</p>
            </CardContent>
          </Card>
        </div>
        <Button onClick={() => setFormOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />Add bill
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your recurring bills</CardTitle>
          <p className="text-xs text-muted">
            Set the amount and how often each bill or income repeats
          </p>
        </CardHeader>
        <CardContent>
          {!items.length ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="rounded-full bg-surface-2 p-3 text-muted">
                <RefreshCw className="h-5 w-5" />
              </div>
              {hasTransactions === false ? (
                <>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Add your first transaction to get started
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-muted">
                    Once you have spending history, you can track recurring bills here.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link to={ROUTES.TRANSACTIONS}>Add transaction</Link>
                  </Button>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  No bills yet. Add one to track recurring payments.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <CategoryIcon categoryId={item.category} size="md" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-foreground">{item.description}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {FREQUENCY_LABELS[item.frequency] ?? item.frequency}
                        </Badge>
                        <Badge
                          variant={item.type === 'income' ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">
                        {item.last_paid ? `Last paid ${formatDate(item.last_paid)}` : 'No payments recorded'}
                        {' · '}
                        <CurrencyDisplay amount={item.monthly_amount} />/mo est.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span
                      className={`mr-2 font-semibold ${
                        item.type === 'income' ? 'text-success' : 'text-danger'
                      }`}
                    >
                      <CurrencyDisplay amount={item.amount} />
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Record payment"
                      onClick={() => handlePay(item)}
                    >
                      <Wallet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditBill(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Pagination
            className="mt-4"
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add recurring bill</DialogTitle></DialogHeader>
          <RecurringBillForm
            onSubmit={handleCreate}
            onCancel={() => setFormOpen(false)}
            isSubmitting={saving}
          />
        </DialogContent>
      </Dialog>

      {editBill && (
        <Dialog open onOpenChange={(v) => !v && setEditBill(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit bill</DialogTitle></DialogHeader>
            <RecurringBillForm
              defaultValues={editBill}
              onSubmit={handleUpdate}
              onCancel={() => setEditBill(null)}
              isSubmitting={saving}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
