import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { goalSchema, GOAL_COLORS, GOAL_ICONS } from '@/schemas/goalSchema';
import { toISODateString } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

export default function GoalForm({ defaultValues, onSubmit, onCancel, isSubmitting = false }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      target_amount: '',
      current_amount: 0,
      target_date: toISODateString(new Date(Date.now() + 86400000 * 365)),
      icon: '🎯',
      color: GOAL_COLORS[0],
      ...defaultValues,
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="target_amount">Target amount</Label>
          <Input id="target_amount" type="number" step="0.01" {...register('target_amount')} />
          {errors.target_amount && <p className="text-xs text-danger">{errors.target_amount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_amount">Current amount</Label>
          <Input id="current_amount" type="number" step="0.01" {...register('current_amount')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="target_date">Target date</Label>
        <Input id="target_date" type="date" {...register('target_date')} />
        {errors.target_date && <p className="text-xs text-danger">{errors.target_date.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {GOAL_ICONS.map((icon) => (
            <button key={icon} type="button" onClick={() => setValue('icon', icon)} className={cn('rounded-lg border px-2 py-1 text-lg', selectedIcon === icon ? 'border-primary bg-primary/10' : 'border-border')}>{icon}</button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {GOAL_COLORS.map((color) => (
            <button key={color} type="button" onClick={() => setValue('color', color)} className={cn('h-8 w-8 rounded-full border-2', selectedColor === color ? 'border-foreground' : 'border-transparent')} style={{ backgroundColor: color }} aria-label={color} />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}
