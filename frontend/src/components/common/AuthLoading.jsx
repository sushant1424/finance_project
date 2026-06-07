import { LineChart } from 'lucide-react';

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LineChart className="h-5 w-5" />
        </div>
        <p className="text-sm text-foreground">Loading FinSight…</p>
      </div>
    </div>
  );
}
