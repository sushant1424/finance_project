import { Link } from 'react-router-dom';
import { LineChart } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';
import { ROUTES } from '@/constants/routes';

export default function AuthNavbar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to={ROUTES.LANDING} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <LineChart className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold text-foreground">FinSight</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
