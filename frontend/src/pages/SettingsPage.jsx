import PageHeader from '@/components/common/PageHeader';
import SettingsTabs from '@/features/settings/SettingsTabs';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Customize your FinSight experience." />
      <SettingsTabs />
    </div>
  );
}
