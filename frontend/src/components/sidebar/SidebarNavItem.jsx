import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function SidebarNavItem({ to, icon: Icon, label, expanded, badge = 0 }) {
  return (
    <NavLink
      to={to}
      title={!expanded ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded-md text-[13px] font-medium',
          expanded ? 'gap-2.5 px-2.5 py-2' : 'justify-center p-2',
          isActive
            ? 'bg-primary/12 text-primary'
            : 'text-muted hover:bg-surface-2 hover:text-foreground',
        )
      }
    >
      <span className="relative shrink-0">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        {badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      {expanded && (
        <>
          <span className="truncate">{label}</span>
          {badge > 0 && (
            <span className="ml-auto rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
