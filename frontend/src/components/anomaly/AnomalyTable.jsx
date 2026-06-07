import { ShieldAlert } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import SkeletonTable from '@/components/common/SkeletonTable';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import CategoryIcon from '@/components/transactions/CategoryIcon';
import AnomalySeverityBadge from '@/components/anomaly/AnomalySeverityBadge';
import { getCategoryById } from '@/constants/categories';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

export default function AnomalyTable({ anomalies = [], loading = false, onReview, className }) {
  if (loading) return <SkeletonTable rows={5} columns={6} className={className} />;

  if (!anomalies.length) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="No anomalies found"
        description="Your spending looks normal for the selected period."
        className={className}
      />
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-surface-1', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Z-Score</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead className="w-24 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {anomalies.map((a) => {
            const category = getCategoryById(a.category);
            return (
              <TableRow key={a.id}>
                <TableCell className="whitespace-nowrap text-muted">{formatDate(a.date)}</TableCell>
                <TableCell className="font-medium">{a.description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CategoryIcon categoryId={a.category} size="sm" />
                    <span className="text-sm">{category?.label}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right"><CurrencyDisplay amount={a.amount} /></TableCell>
                <TableCell className="tabular-nums">{a.z_score?.toFixed(2) ?? '—'}</TableCell>
                <TableCell><AnomalySeverityBadge severity={a.anomaly_severity} /></TableCell>
                <TableCell className="text-right">
                  {!a.anomaly_reviewed && onReview && (
                    <Button size="sm" variant="outline" onClick={() => onReview(a)}>Review</Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
