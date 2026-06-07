import { Wallet, Target, LineChart } from 'lucide-react';

const STEPS = [
  {
    icon: Wallet,
    title: 'Add income & expenses',
    desc: 'Log transactions manually. Every entry is stored securely and used to power your insights.',
  },
  {
    icon: Target,
    title: 'Set budgets & goals',
    desc: 'Define monthly spending limits per category and create savings goals with target dates.',
  },
  {
    icon: LineChart,
    title: 'Let FinSight analyze',
    desc: 'Get your Health Score, smart insights, anomaly alerts, and spending-day patterns — all from your real data.',
  },
];

export default function LandingHowItWorks() {
  return (
    <section className="border-y border-border bg-surface-1/30 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground">Three steps to clarity</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">No bank sync required. Your numbers stay yours.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="rounded-xl border border-border bg-surface-1 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Step {i + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
