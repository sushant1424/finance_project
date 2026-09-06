import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SidebarCollapsibleGroup({
  title,
  icon: Icon,
  items,
  expanded,
  defaultOpen = true,
}) {
  const location = useLocation();
  const isChildActive = items.some((item) => location.pathname === item.path);
  const [open, setOpen] = useState(defaultOpen || isChildActive);

  if (!expanded) {
    return (
      <div className="space-y-0.5">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 text-[13px] font-medium",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )
              }
            >
              <ItemIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </NavLink>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
          isChildActive
            ? "text-primary"
            : "text-muted hover:bg-surface-2 hover:text-foreground",
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
        <span className="flex-1 truncate text-left">{title}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-2">
          {items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium",
                    isActive
                      ? "bg-primary/12 text-primary"
                      : "text-muted hover:bg-surface-2 hover:text-foreground",
                  )
                }
              >
                <ItemIcon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
