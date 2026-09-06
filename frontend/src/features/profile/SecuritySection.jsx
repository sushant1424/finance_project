import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import authApi from '@/api/authApi';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { getApiErrorMessage } from '@/utils/apiError';
import { changePasswordSchema } from '@/schemas/authSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecuritySection() {
  const confirm = useConfirm();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data) => {
    const ok = await confirm({
      title: 'Change password?',
      description: 'Your password will be updated immediately.',
      confirmLabel: 'Update password',
    });
    if (!ok) return;
    try {
      await authApi.changePassword(data);
      toast.success('Password updated');
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update password'));
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Security</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="current_password">Current password</Label>
            <Input id="current_password" type="password" {...register('current_password')} className="mt-1.5" />
            {errors.current_password && <p className="mt-1 text-sm text-danger">{errors.current_password.message}</p>}
          </div>
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
          <Button type="submit">Update password</Button>
        </form>
      </CardContent>
    </Card>
  );
}
