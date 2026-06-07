import { cn } from '@/lib/utils';

export default function PageHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {action && <div className="mt-4 shrink-0 sm:mt-0">{action}</div>}
    </div>
  );
}
