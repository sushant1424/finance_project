import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import CategoryIcon from '@/components/transactions/CategoryIcon';
import TransactionTypeBadge from '@/components/transactions/TransactionTypeBadge';
import { getCategoryById } from '@/constants/categories';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

export default function TransactionRow({
  transaction,
  selected = false,
  onToggleSelect,
  onEdit,
  onDelete,
  showActions = true,
}) {
  const category = getCategoryById(transaction.category);

  return (
    <TableRow data-state={selected ? 'selected' : undefined}>
      {onToggleSelect && (
        <TableCell className="w-10">
          <Checkbox checked={selected} onCheckedChange={() => onToggleSelect(transaction.id)} />
        </TableCell>
      )}
      <TableCell className="whitespace-nowrap text-muted">{formatDate(transaction.date)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <CategoryIcon categoryId={transaction.category} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium">{transaction.description}</p>
            <p className="text-xs text-muted">{category?.label ?? transaction.category}</p>
          </div>
        </div>
      </TableCell>
      <TableCell><TransactionTypeBadge type={transaction.type} /></TableCell>
      <TableCell className="text-right">
        <CurrencyDisplay
          amount={transaction.amount}
          className={cn('font-medium', transaction.type === 'income' ? 'text-success' : 'text-danger')}
        />
      </TableCell>
      {showActions && (
        <TableCell className="w-24 text-right">
          <div className="flex justify-end gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(transaction)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => onDelete(transaction)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
