import { useState } from 'react';
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, subMonths,
} from 'date-fns';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

const PRESETS = [
  { id: 'today', label: 'Today', getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { id: 'week', label: 'This Week', getRange: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
  { id: 'month', label: 'This Month', getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { id: 'lastMonth', label: 'Last Month', getRange: () => {
    const d = subMonths(new Date(), 1);
    return { from: startOfMonth(d), to: endOfMonth(d) };
  }},
  { id: 'last3', label: 'Last 3 Months', getRange: () => ({
    from: startOfMonth(subMonths(new Date(), 2)),
    to: endOfMonth(new Date()),
  })},
  { id: 'last6', label: 'Last 6 Months', getRange: () => ({
    from: startOfMonth(subMonths(new Date(), 5)),
    to: endOfMonth(new Date()),
  })},
];

export default function DateRangePicker({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState({ from: '', to: '' });

  const label = value?.from && value?.to
    ? `${formatDate(value.from)} – ${formatDate(value.to)}`
    : 'Select date range';

  const applyPreset = (preset) => {
    onChange?.(preset.getRange());
    setOpen(false);
  };

  const applyCustom = () => {
    if (!custom.from || !custom.to) return;
    onChange?.({ from: new Date(custom.from), to: new Date(custom.to) });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('justify-start gap-2 border-border bg-surface-2', className)}>
          <Calendar className="h-4 w-4 text-muted" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-surface-1 border-border p-3" align="start">
        <div className="grid gap-1">
          {PRESETS.map((preset) => (
            <Button key={preset.id} variant="ghost" className="justify-start" onClick={() => applyPreset(preset)}>
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted">Custom range</p>
          <Input type="date" value={custom.from} onChange={(e) => setCustom((p) => ({ ...p, from: e.target.value }))} className="bg-surface-2" />
          <Input type="date" value={custom.to} onChange={(e) => setCustom((p) => ({ ...p, to: e.target.value }))} className="bg-surface-2" />
          <Button size="sm" className="w-full" onClick={applyCustom}>Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
