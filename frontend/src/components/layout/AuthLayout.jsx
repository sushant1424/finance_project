import { Outlet } from 'react-router-dom';
import AuthNavbar from '@/components/layout/AuthNavbar';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AuthNavbar />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Outlet />
      </main>
    </div>
  );
}
