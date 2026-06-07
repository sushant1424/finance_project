import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function SkeletonCard({ className }) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface-1 p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="mt-6 h-16 w-full rounded-lg" />
    </div>
  );
}
