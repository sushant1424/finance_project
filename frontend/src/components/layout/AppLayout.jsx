import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '@/components/sidebar/Sidebar';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const expanded = useSelector((state) => state.ui.sidebarExpanded);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={cn('min-h-screen', expanded ? 'ml-[240px]' : 'ml-[64px]')}>
        <div className="mx-auto w-full max-w-[1400px] px-6 py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
