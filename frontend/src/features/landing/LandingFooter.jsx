import { LineChart } from 'lucide-react';

const PRODUCT_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'How it works', href: '#how-it-works' },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface-1 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">FinSight</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Personal finance tracking for budgets, goals, bills, and clear spending insights.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Product</p>
            <ul className="mt-3 space-y-2">
              {PRODUCT_LINKS.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-muted hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} FinSight. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
