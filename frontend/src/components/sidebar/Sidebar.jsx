import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LineChart, LayoutDashboard, Bell, TrendingUp, ArrowLeftRight, PiggyBank,
  Target, BarChart3, Lightbulb, AlertTriangle, User, Settings, PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/common/ThemeToggle';
import { NAV_ITEMS } from '@/constants/routes';
import { setSidebarExpanded } from '@/store/uiSlice';
import SidebarSection from '@/components/sidebar/SidebarSection';
import SidebarNavItem from '@/components/sidebar/SidebarNavItem';
import SidebarUserFooter from '@/components/sidebar/SidebarUserFooter';
import { cn } from '@/lib/utils';

const ICONS = {
  LayoutDashboard, TrendingUp, ArrowLeftRight, PiggyBank,
  Target, BarChart3, Lightbulb, AlertTriangle, User, Settings, Bell,
};

const SECTIONS = [
  { key: 'overview', title: 'OVERVIEW' },
  { key: 'money', title: 'MONEY' },
  { key: 'insights', title: 'INSIGHTS' },
  { key: 'account', title: 'ACCOUNT' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const expanded = useSelector((state) => state.ui.sidebarExpanded);
  const { unreadCount } = useNotifications();

  const toggle = useCallback(() => {
    dispatch(setSidebarExpanded(!expanded));
  }, [dispatch, expanded]);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface-1',
        expanded ? 'w-[240px]' : 'w-[64px]',
      )}
    >
      <div className={cn('flex h-14 items-center border-b border-border', expanded ? 'px-4' : 'justify-center px-2')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <LineChart className="h-4 w-4" />
        </div>
        {expanded && <span className="ml-3 flex-1 text-base font-semibold text-foreground">FinSight</span>}
        {expanded && <ThemeToggle size="icon" className="h-8 w-8" />}
      </div>

      <ScrollArea className="flex-1 py-3">
        <div className={cn('space-y-5', expanded ? 'px-3' : 'px-2')}>
          {SECTIONS.map(({ key, title }) => (
            <SidebarSection key={key} title={title} expanded={expanded}>
              {NAV_ITEMS[key].map((item) => (
                <SidebarNavItem
                  key={item.path}
                  to={item.path}
                  icon={ICONS[item.icon]}
                  label={item.label}
                  expanded={expanded}
                  badge={item.showBadge ? unreadCount : 0}
                />
              ))}
            </SidebarSection>
          ))}
        </div>
      </ScrollArea>

      <div className={cn('border-t border-border p-2', expanded ? 'px-3' : 'px-2')}>
        {!expanded && (
          <div className="mb-2 flex justify-center">
            <ThemeToggle size="icon" className="h-8 w-8" />
          </div>
        )}
        <Button
          variant="ghost"
          size={expanded ? 'sm' : 'icon'}
          onClick={toggle}
          className={cn('w-full text-muted hover:text-foreground', !expanded && 'h-8 w-8')}
        >
          {expanded ? (
            <span className="flex items-center gap-2"><PanelLeftClose className="h-4 w-4" /> Collapse</span>
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <SidebarUserFooter expanded={expanded} />
    </aside>
  );
}
