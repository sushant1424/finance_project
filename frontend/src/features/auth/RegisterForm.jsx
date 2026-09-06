import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '@/schemas/authSchema';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { toastAsyncResult } from '@/utils/toastAsyncResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterForm() {
  const { register: registerUser, loading, error } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const { confirmPassword, ...payload } = data;
    const result = await registerUser(payload);
    if (toastAsyncResult(result, { success: 'Account created! Welcome to FinSight.' })) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-8">
      <h1 className="text-2xl font-bold text-foreground">Create account</h1>
      <p className="mt-2 text-sm text-muted">Start tracking your finances today.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...register('name')} className="mt-1.5" />
          {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1.5" />
          {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password')} className="mt-1.5" />
          {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="mt-1.5" />
          {errors.confirmPassword && <p className="mt-1 text-sm text-danger">{errors.confirmPassword.message}</p>}
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
