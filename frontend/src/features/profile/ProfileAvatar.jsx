import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileAvatar() {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarFallback className="bg-primary/10 text-xl text-primary">{initials}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-xl font-semibold text-foreground">{user?.name ?? 'User'}</h2>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>
    </div>
  );
}
