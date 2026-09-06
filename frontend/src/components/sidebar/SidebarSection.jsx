import { cn } from '@/lib/utils';

export default function SidebarSection({ title, children, expanded }) {
  return (
    <div>
      {expanded && (
        <p className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-wider text-muted/80">
          {title}
        </p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
