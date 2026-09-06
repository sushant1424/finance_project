import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  LayoutDashboard,
  LineChart,
  PanelLeft,
  PanelLeftClose,
  PieChart,
  PiggyBank,
  RefreshCw,
  Settings,
  Tag,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/common/ThemeToggle";
import { NAV_ITEMS, ROUTES, STATISTICS_ITEMS } from "@/constants/routes";
import { setSidebarExpanded } from "@/store/uiSlice";
import SidebarSection from "@/components/sidebar/SidebarSection";
import SidebarNavItem from "@/components/sidebar/SidebarNavItem";
import SidebarCollapsibleGroup from "@/components/sidebar/SidebarCollapsibleGroup";
import SidebarUserFooter from "@/components/sidebar/SidebarUserFooter";
import { cn } from "@/lib/utils";

const ICONS = {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  Wallet,
  Tag,
  Bell,
  Settings,
  RefreshCw,
};

const STATS_ICONS = {
  BarChart3,
  PieChart,
  TrendingUp,
};

const SECTIONS = [
  { key: "overview", title: "Overview" },
  { key: "money", title: "Money" },
];

const statisticsNav = STATISTICS_ITEMS.map((item) => ({
  ...item,
  icon: STATS_ICONS[item.icon],
}));

export default function Sidebar() {
  const dispatch = useDispatch();
  const expanded = useSelector((state) => state.ui.sidebarExpanded);

  const toggle = useCallback(
    () => dispatch(setSidebarExpanded(!expanded)),
    [dispatch, expanded],
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface-1",
        expanded ? "w-[220px]" : "w-[64px]",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-border",
          expanded ? "px-4" : "justify-center px-2",
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <LineChart className="h-4 w-4" />
        </div>
        {expanded && (
          <span className="ml-3 flex-1 text-base font-semibold text-foreground">
            FinSight
          </span>
        )}
        {expanded && <ThemeToggle size="icon" className="h-8 w-8" />}
      </div>

      <ScrollArea className="flex-1 py-3">
        <div className={cn("space-y-4", expanded ? "px-3" : "px-2")}>
          {SECTIONS.map(({ key, title }) => (
            <SidebarSection key={key} title={title} expanded={expanded}>
              {NAV_ITEMS[key].map((item) => (
                <SidebarNavItem
                  key={item.path}
                  to={item.path}
                  icon={ICONS[item.icon]}
                  label={item.label}
                  expanded={expanded}
                />
              ))}
            </SidebarSection>
          ))}

          <SidebarSection title="Planning" expanded={expanded}>
            <SidebarNavItem
              to={ROUTES.BILLS}
              icon={RefreshCw}
              label="Bills"
              expanded={expanded}
            />
          </SidebarSection>

          <div>
            <SidebarCollapsibleGroup
              title="Statistics"
              icon={BarChart3}
              items={statisticsNav}
              expanded={expanded}
            />
          </div>

          <SidebarSection title="Account" expanded={expanded}>
            {NAV_ITEMS.account.map((item) => (
              <SidebarNavItem
                key={item.path}
                to={item.path}
                icon={ICONS[item.icon]}
                label={item.label}
                expanded={expanded}
              />
            ))}
          </SidebarSection>
        </div>
      </ScrollArea>

      <div
        className={cn(
          "border-t border-border p-2",
          expanded ? "px-3" : "px-2",
        )}
      >
        {!expanded && (
          <div className="mb-2 flex justify-center">
            <ThemeToggle size="icon" className="h-8 w-8" />
          </div>
        )}
        {expanded ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="w-full text-muted hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <PanelLeftClose className="h-4 w-4" /> Collapse
            </span>
          </Button>
        ) : (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-8 w-8 text-muted hover:text-foreground"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <SidebarUserFooter expanded={expanded} />
    </aside>
  );
}
