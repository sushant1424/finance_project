import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES } from '@/utils/netWorth';
import { useNetWorth } from '@/hooks/useNetWorth';

function BreakdownList({ title, items, breakdown, total }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map(({ id, label }) => (
          <div key={id} className="flex justify-between text-sm">
            <span className="text-muted">{label}</span>
            <CurrencyDisplay amount={breakdown?.[id] ?? 0} />
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-3 font-semibold">
          <span>Total</span>
          <CurrencyDisplay amount={total} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AssetsLiabilities() {
  const { latest } = useNetWorth(false);

  if (!latest) {
    return <p className="text-sm text-muted">Add a snapshot to see your breakdown.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BreakdownList title="Assets" items={ASSET_CATEGORIES}
        breakdown={latest.assets_breakdown} total={latest.total_assets} />
      <BreakdownList title="Liabilities" items={LIABILITY_CATEGORIES}
        breakdown={latest.liabilities_breakdown} total={latest.total_liabilities} />
    </div>
  );
}
