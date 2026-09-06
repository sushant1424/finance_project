import { useDispatch, useSelector } from 'react-redux';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { setCompactMode } from '@/store/uiSlice';
import { CURRENCIES, DATE_FORMATS } from '@/constants/currencies';
import ProfileEditForm from '@/features/profile/ProfileEditForm';
import SecuritySection from '@/features/profile/SecuritySection';
import DangerZone from '@/features/profile/DangerZone';
import { toastAsyncResult } from '@/utils/toastAsyncResult';

export default function SettingsTabs() {
  const dispatch = useDispatch();
  const compactMode = useSelector((s) => s.ui.compactMode);
  const theme = useSelector((s) => s.ui.theme);
  const { user, updateProfile } = useAuth();

  const save = async (data) => {
    const result = await updateProfile(data);
    toastAsyncResult(result, { success: 'Saved', error: 'Failed to save settings' });
  };

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="display">Display</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Currency</Label>
              <Select defaultValue={user?.currency ?? 'NPR'} onValueChange={(v) => save({ currency: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date format</Label>
              <Select defaultValue={user?.date_format ?? 'DD/MM/YYYY'} onValueChange={(v) => save({ date_format: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="account" className="mt-4 space-y-4">
        <ProfileEditForm />
        <SecuritySection />
        <DangerZone />
      </TabsContent>

      <TabsContent value="display" className="mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Display</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-xs text-muted">{theme === 'light' ? 'Light' : 'Dark'} mode</p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show cents</Label>
              <Switch checked={user?.show_cents ?? true} onCheckedChange={(v) => save({ show_cents: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Compact mode</Label>
              <Switch checked={compactMode} onCheckedChange={(v) => dispatch(setCompactMode(v))} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
