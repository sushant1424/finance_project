import { Link } from 'react-router-dom';
import DashboardPanel from '@/features/dashboard/DashboardPanel';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ROUTES } from '@/constants/routes';

export default function GoalsNudge() {
  const { dashboard } = useAnalytics(true);
  const nudge = dashboard?.goal_nudge;

  return (
    <DashboardPanel title="Goals" to={ROUTES.GOALS} actionLabel="Goals →" minHeight="min-h-[160px]">
      {nudge ? (
        <Link to={ROUTES.GOALS} className="block space-y-2 hover:opacity-90">
          <p className="text-sm text-muted">
            <span className="mr-1.5" aria-hidden>{nudge.icon}</span>
            {nudge.name}
          </p>
          <p className="text-xl font-semibold tabular-nums">
            {Math.round(nudge.progress_pct)}%
            <span className="ml-1 text-sm font-normal text-muted">there</span>
          </p>
        </Link>
      ) : (
        <p className="text-sm text-muted">
          <Link to={ROUTES.GOALS} className="text-primary hover:underline">Add a goal</Link>
          {' '}to track savings.
        </p>
      )}
    </DashboardPanel>
  );
}
