import { Activity, AlertTriangle, Calendar, Lightbulb, PiggyBank, Repeat } from 'lucide-react';

const FEATURES = [
  {
    icon: Activity,
    title: 'Financial Health Score',
    desc: 'One number that blends your savings rate, budget discipline, goal progress, and anomaly history.',
    unique: true,
  },
  {
    icon: AlertTriangle,
    title: 'Z-Score Anomaly Alerts',
    desc: 'Statistical outlier detection flags unusual transactions per category — not just big amounts.',
    unique: true,
  },
  {
    icon: PiggyBank,
    title: 'Budget Pace Predictor',
    desc: 'See mid-month if you will blow past a budget before the month ends, with days-until-exceeded.',
    unique: true,
  },
  {
    icon: Calendar,
    title: 'Spending Day Patterns',
    desc: 'Discover which days you spend most — weekends vs weekdays — from your real transaction history.',
    unique: true,
  },
  {
    icon: Repeat,
    title: 'Recurring Charge Finder',
    desc: 'Automatically spots subscriptions and repeat expenses so you can cut what you forgot about.',
    unique: true,
  },
  {
    icon: Lightbulb,
    title: 'Smart Insights',
    desc: 'Actionable tips generated from your data: runway days, savings benchmarks, and budget warnings.',
    unique: true,
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="border-b border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Why FinSight</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground">Not just another expense tracker</h2>
          <p className="mt-3 text-muted">
            Most apps show you what you spent. FinSight tells you what it means — and what to do next.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, unique }) => (
            <div key={title} className="rounded-xl border border-border bg-surface-1 p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                {unique && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Unique
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
