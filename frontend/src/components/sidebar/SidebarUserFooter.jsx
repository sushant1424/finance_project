import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { logout } from '@/store/authSlice';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

export default function SidebarUserFooter({ expanded }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      <div className={cn('border-t border-border p-3', !expanded && 'flex flex-col items-center gap-2 p-2')}>
        <div className={cn('flex items-center', expanded ? 'gap-2.5' : 'flex-col gap-2')}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLogoutOpen(true)}
            className="h-8 w-8 shrink-0 text-muted hover:text-danger"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out?"
        description="You will need to sign in again to access your account."
        confirmLabel="Log out"
        onConfirm={handleLogout}
      />
    </>
  );
}
