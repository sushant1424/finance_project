import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginSchema } from '@/schemas/authSchema';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { toastAsyncResult } from '@/utils/toastAsyncResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginForm() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname ?? ROUTES.DASHBOARD;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await login(data);
    if (toastAsyncResult(result, { success: `Welcome back, ${result.payload?.user?.name ?? 'there'}!` })) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-surface-1 p-8">
      <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
      <p className="mt-2 text-sm text-muted">Welcome back. Enter your credentials.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1.5" />
          {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password')} className="mt-1.5" />
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-muted hover:text-primary transition-colors"
              onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
            >
              Forgot password?
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
