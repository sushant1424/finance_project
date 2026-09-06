import {
  Bell,
  PiggyBank,
  RefreshCw,
  Tag,
  Target,
  Wallet,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Wallet,
    title: 'Multiple accounts',
    desc: 'Keep cash, bank, and cards separate. Pick a default account so new spending lands in the right place.',
  },
  {
    icon: Tag,
    title: 'Category suggestions',
    desc: 'Describe a purchase and FinSight suggests a category. Accept it in one tap or choose your own.',
  },
  {
    icon: PiggyBank,
    title: 'Budgets that keep pace',
    desc: 'Set monthly limits and see early if you are on track or spending too fast.',
  },
  {
    icon: Target,
    title: 'Savings goals',
    desc: 'Save toward something real. Track progress and get nudged when a goal needs attention.',
  },
  {
    icon: RefreshCw,
    title: 'Bills and subscriptions',
    desc: 'Track recurring payments in one place and know what is due before it surprises you.',
  },
  {
    icon: Bell,
    title: 'Helpful notifications',
    desc: 'Budget warnings, goal reminders, and bill alerts in one inbox so nothing slips by.',
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="border-b border-border px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Why FinSight</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground">Everything you need to stay on top of money</h2>
          <p className="mt-3 text-muted">
            Simple tools for everyday spending, saving, and bills. No clutter.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-surface-1 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
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
