import PageHeader from '@/components/common/PageHeader';
import GoalsGrid from '@/features/goals/GoalsGrid';
import GoalFormDialog from '@/features/goals/GoalFormDialog';

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Goals" description="Save for what matters most." action={<GoalFormDialog />} />
      <GoalsGrid />
    </div>
  );
}
