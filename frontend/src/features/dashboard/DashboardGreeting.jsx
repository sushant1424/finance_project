import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatDate';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardGreeting() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        {getGreeting()}, {firstName} 👋
      </h1>
      <p className="mt-1 text-sm text-muted">{formatDate(new Date(), user?.date_format)}</p>
    </div>
  );
}
