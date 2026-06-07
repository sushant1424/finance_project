import { Link } from 'react-router-dom';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export default function LandingHero() {
  const { isAuthenticated, initialized } = useAuth();

  return (
    <section className="hero-gradient border-b border-border px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
          Your money,{' '}
          <span className="text-primary">finally making sense</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted lg:text-lg">
          Track spending, set budgets, detect unusual expenses, and reach your savings goals —
          all in one clean dashboard.
        </p>
        {initialized && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Button asChild size="lg">
                <Link to={ROUTES.DASHBOARD}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to={ROUTES.REGISTER}>
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
