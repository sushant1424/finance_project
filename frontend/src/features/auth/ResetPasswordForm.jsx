import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPasswordSchema } from '@/schemas/authSchema';
import authApi from '@/api/authApi';
import { ROUTES } from '@/constants/routes';
import { getApiErrorMessage } from '@/utils/apiError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ResetPasswordForm() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-8 text-center">
        <p className="text-sm text-muted">Invalid reset link.</p>
        <Link to={ROUTES.FORGOT_PASSWORD} className="mt-4 inline-block text-sm text-primary hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      await authApi.resetPassword(token, data.new_password);
      toast.success('Password updated. You can sign in now.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not reset password'));
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-8">
      <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
      <p className="mt-2 text-sm text-muted">Choose a new password for your account.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="new_password">New password</Label>
          <Input id="new_password" type="password" {...register('new_password')} className="mt-1.5" />
          {errors.new_password && <p className="mt-1 text-sm text-danger">{errors.new_password.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirm_password">Confirm password</Label>
          <Input id="confirm_password" type="password" {...register('confirm_password')} className="mt-1.5" />
          {errors.confirm_password && <p className="mt-1 text-sm text-danger">{errors.confirm_password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}
