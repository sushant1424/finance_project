import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('rounded-md bg-surface-2 opacity-70', className)}
      {...props}
    />
  );
}

export { Skeleton };
