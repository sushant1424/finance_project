import toast from 'react-hot-toast';
import AnomalyTableUI from '@/components/anomaly/AnomalyTable';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useAnomalies } from '@/hooks/useAnomalies';

export default function AnomalyTable() {
  const { items, loading, review } = useAnomalies();
  const confirm = useConfirm();

  const handleReview = async (a) => {
    const ok = await confirm({ title: 'Mark as reviewed?', description: `"${a.description}"`, confirmLabel: 'Review' });
    if (!ok) return;
    try {
      await review(a.id);
      toast.success('Marked as reviewed');
    } catch {
      toast.error('Failed to review');
    }
  };

  return <AnomalyTableUI anomalies={items} loading={loading} onReview={handleReview} />;
}
