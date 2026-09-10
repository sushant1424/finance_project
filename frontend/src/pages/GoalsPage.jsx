import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import GoalsGrid from '@/features/goals/GoalsGrid';
import GoalFormDialog from '@/features/goals/GoalFormDialog';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { downloadCsv, rowsToCsv } from '@/utils/downloadCsv';

export default function GoalsPage() {
  const { items } = useGoals();
  const confirm = useConfirm();

  const handleExportCsv = async () => {
    const ok = await confirm({
      title: 'Export goals?',
      description: 'Download all goals as CSV.',
      confirmLabel: 'Export',
    });
    if (!ok) return;
    const headers = ['Name', 'Target Amount', 'Current Amount', 'Progress %', 'Target Date', 'Status'];
    const rows = items.map((g) => {
      const pct = g.target_amount ? ((g.current_amount / g.target_amount) * 100).toFixed(1) : '0';
      const status = g.current_amount >= g.target_amount ? 'Completed' : 'In Progress';
      return [g.name, g.target_amount, g.current_amount, pct, g.target_date ?? '', status];
    });
    downloadCsv('goals.csv', rowsToCsv(headers, rows));
    toast.success('Goals CSV downloaded');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Save for what matters most."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!items.length}>
              <Download className="h-4 w-4" />Export CSV
            </Button>
            <GoalFormDialog />
          </div>
        }
      />
      <GoalsGrid />
    </div>
  );
}
