import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '@/components/sidebar/Sidebar';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const expanded = useSelector((state) => state.ui.sidebarExpanded);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={cn('min-h-screen', expanded ? 'ml-[220px]' : 'ml-[64px]')}>
        <div
          className={cn(
            'mx-auto w-full py-6 pb-24',
            expanded ? 'max-w-[1400px] px-6 lg:px-8' : 'max-w-[1520px] px-4 lg:px-5',
          )}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
