import { LineChart, Mail, Shield, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How it works', href: '#how-it-works' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: 'http://localhost:8000/docs' },
    { label: 'Changelog', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Security', href: '#' },
  ],
};

export default function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface-1 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">FinSight</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Smart personal finance tracking with anomaly detection and budget pacing.
            </p>
            <div className="mt-4 flex gap-3 text-muted">
              <a href="#" aria-label="GitHub"><Code2 className="h-4 w-4 hover:text-foreground" /></a>
              <a href="mailto:support@finsight.app" aria-label="Email"><Mail className="h-4 w-4 hover:text-foreground" /></a>
              <Shield className="h-4 w-4" title="SOC 2 ready" />
            </div>
          </div>
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p className="text-sm font-semibold text-foreground">{section}</p>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith('http') ? (
                      <a href={item.href} className="text-sm text-muted hover:text-foreground">{item.label}</a>
                    ) : item.href.startsWith('#') ? (
                      <a href={item.href} className="text-sm text-muted hover:text-foreground">{item.label}</a>
                    ) : (
                      <Link to={item.href} className="text-sm text-muted hover:text-foreground">{item.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} FinSight. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
