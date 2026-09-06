import { Link } from 'react-router-dom';
import { LineChart, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export default function LandingNavbar() {
  const { isAuthenticated, initialized } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-1/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to={ROUTES.LANDING} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <LineChart className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold text-foreground">FinSight</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted hover:text-foreground">Features</a>
          <a href="#pricing" className="text-sm text-muted hover:text-foreground">Pricing</a>
          <a href="#how-it-works" className="text-sm text-muted hover:text-foreground">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {initialized && isAuthenticated ? (
            <Button asChild size="sm">
              <Link to={ROUTES.DASHBOARD}><LayoutDashboard className="mr-1.5 h-4 w-4" />Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to={ROUTES.LOGIN}>Sign in</Link></Button>
              <Button asChild size="sm"><Link to={ROUTES.REGISTER}>Get started</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
