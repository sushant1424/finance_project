import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const PRESET_ICONS = ['📁', '🏷️', '💼', '🛒', '🎪', '🏋️', '🎯', '💡', '🎸', '🍕', '🚀', '🌿'];
export const PRESET_COLORS = ['#71717a', '#10b981', '#a855f7', '#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#f97316', '#10b981'];

export default function CategoryForm({ defaultValues, onSubmit, onCancel }) {
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [icon, setIcon] = useState(defaultValues?.icon ?? '📁');
  const [color, setColor] = useState(defaultValues?.color ?? '#71717a');

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit({ name, icon, color }); }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="cat-name">Name</Label>
        <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} />
      </div>
      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_ICONS.map((i) => (
            <button key={i} type="button" onClick={() => setIcon(i)}
              className={cn('rounded-lg border px-2 py-1 text-lg transition-colors',
                icon === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}>
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={cn('h-8 w-8 rounded-full border-2 transition-all', color === c ? 'border-foreground scale-110' : 'border-transparent')}
              style={{ backgroundColor: c }} aria-label={c} />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
