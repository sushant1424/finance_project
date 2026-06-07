import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { profileSchema } from '@/schemas/authSchema';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { CURRENCIES } from '@/constants/currencies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileEditForm() {
  const { user, updateProfile } = useAuth();
  const confirm = useConfirm();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      currency: user?.currency ?? 'NPR',
      date_format: user?.date_format ?? 'DD/MM/YYYY',
    },
  });

  const onSubmit = async (data) => {
    const ok = await confirm({
      title: 'Save profile changes?',
      description: 'Update your profile information?',
      confirmLabel: 'Save',
    });
    if (!ok) return;
    const result = await updateProfile(data);
    if (result?.meta?.requestStatus === 'fulfilled') toast.success('Profile updated');
  };

  return (
    <Card>
      <CardHeader><CardTitle>Edit profile</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} className="mt-1.5" />
            {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} className="mt-1.5" />
          </div>
          <div>
            <Label>Currency</Label>
            <Select defaultValue={user?.currency ?? 'NPR'} onValueChange={(v) => setValue('currency', v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
