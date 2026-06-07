import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useAuth } from '@/hooks/useAuth';
import { setCompactMode } from '@/store/uiSlice';
import { CURRENCIES, DATE_FORMATS, FIRST_DAY_OPTIONS } from '@/constants/currencies';

export default function SettingsTabs() {
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const compactMode = useSelector((s) => s.ui.compactMode);
  const theme = useSelector((s) => s.ui.theme);
  const { user, updateProfile } = useAuth();

  const save = async (data, label) => {
    const ok = await confirm({
      title: 'Save settings?',
      description: `Update ${label}?`,
      confirmLabel: 'Save',
    });
    if (!ok) return;
    const result = await updateProfile(data);
    if (result?.meta?.requestStatus === 'fulfilled') toast.success('Settings saved');
  };

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="display">Display</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="mt-4">
        <Card>
          <CardHeader><CardTitle>General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Currency</Label>
              <Select defaultValue={user?.currency ?? 'NPR'} onValueChange={(v) => save({ currency: v }, 'currency')}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date format</Label>
              <Select defaultValue={user?.date_format ?? 'DD/MM/YYYY'} onValueChange={(v) => save({ date_format: v }, 'date format')}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notifications" className="mt-4">
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted">
              All alerts appear on the Notifications page — anomalies, budget warnings, and goal reminders.
            </p>
            <div className="flex items-center justify-between">
              <Label>Anomaly alerts</Label>
              <Switch defaultChecked disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label>Budget warnings</Label>
              <Switch defaultChecked disabled />
            </div>
            <div className="flex items-center justify-between">
              <Label>Goal reminders</Label>
              <Switch defaultChecked disabled />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="display" className="mt-4">
        <Card>
          <CardHeader><CardTitle>Display</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-xs text-muted">{theme === 'light' ? 'Light mode' : 'Dark mode'}</p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show cents</Label>
              <Switch checked={user?.show_cents ?? true} onCheckedChange={(v) => save({ show_cents: v }, 'decimal display')} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Compact mode</Label>
              <Switch checked={compactMode} onCheckedChange={(v) => dispatch(setCompactMode(v))} />
            </div>
            <div>
              <Label>First day of week</Label>
              <Select defaultValue={user?.first_day_of_week ?? 'Sunday'} onValueChange={(v) => save({ first_day_of_week: v }, 'first day of week')}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIRST_DAY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="data" className="mt-4">
        <Card>
          <CardHeader><CardTitle>Data</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted">Export your transaction data as CSV from the Transactions page.</p>
            <Button variant="outline" onClick={() => toast('Use Export on Transactions page')}>Export data</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
