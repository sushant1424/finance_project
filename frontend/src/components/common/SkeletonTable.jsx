import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function SkeletonTable({ rows = 5, columns = 5, className }) {
  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-border', className)}>
      <div className="flex gap-4 border-b border-border bg-surface-1 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border bg-surface-1">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={`row-${row}`} className="flex gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton
                key={`cell-${row}-${col}`}
                className={cn('h-4 flex-1', col === 0 && 'max-w-[80px]')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
