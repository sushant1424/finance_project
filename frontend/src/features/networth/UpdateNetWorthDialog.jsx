import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useNetWorth } from '@/hooks/useNetWorth';
import { buildSnapshotPayload, ASSET_CATEGORIES, LIABILITY_CATEGORIES } from '@/utils/netWorth';
import { toISODateString } from '@/utils/formatDate';

export default function UpdateNetWorthDialog() {
  const [open, setOpen] = useState(false);
  const { create } = useNetWorth(false);
  const confirm = useConfirm();
  const [assets, setAssets] = useState({});
  const [liabilities, setLiabilities] = useState({});
  const [date, setDate] = useState(toISODateString(new Date()));

  const setField = (setter, id, val) => setter((prev) => ({ ...prev, [id]: parseFloat(val) || 0 }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const ok = await confirm({
      title: 'Save net worth?',
      description: 'This will record your current asset and liability values.',
      confirmLabel: 'Save',
    });
    if (!ok) return;
    try {
      await create(buildSnapshotPayload(assets, liabilities, date));
      toast.success('Net worth saved');
      setOpen(false);
    } catch {
      toast.error('Failed to save');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" />Update net worth</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Update net worth</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="snapshot_date">Snapshot date</Label>
            <Input id="snapshot_date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <p className="mb-2 font-medium">Assets</p>
            {ASSET_CATEGORIES.map(({ id, label }) => (
              <div key={id} className="mb-2">
                <Label>{label}</Label>
                <Input type="number" step="0.01" className="mt-1" onChange={(e) => setField(setAssets, id, e.target.value)} />
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 font-medium">Liabilities</p>
            {LIABILITY_CATEGORIES.map(({ id, label }) => (
              <div key={id} className="mb-2">
                <Label>{label}</Label>
                <Input type="number" step="0.01" className="mt-1" onChange={(e) => setField(setLiabilities, id, e.target.value)} />
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
