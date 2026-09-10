import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Free',
    price: 'Rs. 0',
    period: 'forever',
    description: 'Everything you need to start tracking your finances.',
    highlighted: false,
    cta: 'Get started free',
    href: ROUTES.REGISTER,
    features: [
      { text: 'Unlimited transactions', included: true },
      { text: 'Up to 5 budgets', included: true },
      { text: 'Up to 3 savings goals', included: true },
      { text: 'Multiple accounts', included: true },
      { text: 'Bills tracking', included: true },
      { text: 'Basic reports and charts', included: true },
      { text: 'PDF export', included: false },
      { text: 'Priority support', included: false },
      { text: 'Advanced trend analysis', included: false },
    ],
  },
  {
    name: 'Pro',
    price: 'Rs. 499',
    period: '/month',
    description: 'For people who want deeper insights and unlimited room to grow.',
    highlighted: true,
    cta: 'Coming soon',
    href: ROUTES.REGISTER,
    features: [
      { text: 'Unlimited transactions', included: true },
      { text: 'Unlimited budgets', included: true },
      { text: 'Unlimited savings goals', included: true },
      { text: 'Multiple accounts', included: true },
      { text: 'Bills tracking', included: true },
      { text: 'Advanced reports and charts', included: true },
      { text: 'PDF export', included: true },
      { text: 'Priority support', included: true },
      { text: 'Deeper spending trends', included: true },
    ],
  },
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="border-b border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground">Simple, transparent plans</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Start free today. Pro features are coming soon, with no payment required right now.
          </p>
        </div>
        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'flex h-full flex-col rounded-xl border p-8',
                plan.highlighted
                  ? 'border-primary bg-surface-1 ring-1 ring-primary/20'
                  : 'border-border bg-surface-1',
              )}
            >
              <div className="min-h-[1.75rem]">
                {plan.highlighted ? (
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Most popular
                  </span>
                ) : null}
              </div>
              <h3 className="mt-2 text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums text-foreground">{plan.price}</span>
                <span className="text-sm text-muted">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm text-muted">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm">
                    {f.included ? (
                      <Check className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-muted/50" />
                    )}
                    <span className={f.included ? 'text-foreground' : 'text-muted'}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full" variant={plan.highlighted ? 'default' : 'outline'}>
                <Link to={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
