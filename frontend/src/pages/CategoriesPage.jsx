import PageHeader from '@/components/common/PageHeader';
import CategoriesSettings from '@/features/settings/CategoriesSettings';

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Built-in and custom spending categories."
      />
      <CategoriesSettings />
    </div>
  );
}
