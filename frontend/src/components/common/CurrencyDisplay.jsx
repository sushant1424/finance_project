import { useSelector } from 'react-redux';
import { formatCurrency } from '@/utils/formatCurrency';
import { cn } from '@/lib/utils';

export default function CurrencyDisplay({
  amount,
  currency: currencyProp,
  showCents: showCentsProp,
  className,
}) {
  const user = useSelector((state) => state.auth.user);
  const currency = currencyProp ?? user?.currency ?? 'NPR';
  const showCents = showCentsProp ?? user?.show_cents ?? true;

  const formatted = formatCurrency(amount, currency, showCents);

  return (
    <span className={cn('tabular-nums', className)} title={formatted}>
      {formatted}
    </span>
  );
}
