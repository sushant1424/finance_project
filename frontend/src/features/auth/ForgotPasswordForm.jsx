import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPasswordSchema } from '@/schemas/authSchema';
import authApi from '@/api/authApi';
import { ROUTES } from '@/constants/routes';
import { getApiErrorMessage } from '@/utils/apiError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await authApi.forgotPassword(data.email);
      toast.success('If that email exists, we sent a reset link. Check your inbox.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not send reset link'));
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-8">
      <h1 className="text-2xl font-bold text-foreground">Forgot password</h1>
      <p className="mt-2 text-sm text-muted">Enter your email and we&apos;ll send a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1.5" />
          {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}
