import PageHeader from '@/components/common/PageHeader';
import ProfileAvatar from '@/features/profile/ProfileAvatar';
import ProfileEditForm from '@/features/profile/ProfileEditForm';
import ProfileStats from '@/features/profile/ProfileStats';
import SecuritySection from '@/features/profile/SecuritySection';
import DangerZone from '@/features/profile/DangerZone';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account and preferences." />
      <ProfileAvatar />
      <ProfileStats />
      <ProfileEditForm />
      <SecuritySection />
      <DangerZone />
    </div>
  );
}
