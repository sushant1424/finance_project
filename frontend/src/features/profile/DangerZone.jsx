import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '@/api/authApi';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DangerZone() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await authApi.deleteAccount();
      logout();
      toast.success('Account deleted');
      navigate(ROUTES.LANDING);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete account');
    }
  };

  return (
    <>
      <Card className="border-danger/30">
        <CardHeader><CardTitle className="text-danger">Danger zone</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted">Permanently delete your account and all data.</p>
          <Button variant="destructive" onClick={() => setOpen(true)}>Delete account</Button>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete account?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}
