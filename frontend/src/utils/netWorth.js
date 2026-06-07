export function computeNetWorth(totalAssets, totalLiabilities) {
  return Math.round((Number(totalAssets) - Number(totalLiabilities)) * 100) / 100;
}

export function sumBreakdown(breakdown = {}) {
  return Object.values(breakdown).reduce((sum, val) => sum + Number(val || 0), 0);
}

export function computeChange(current, previous) {
  const curr = Number(current);
  const prev = Number(previous);
  const change = curr - prev;
  const changePct = prev !== 0 ? (change / Math.abs(prev)) * 100 : 0;

  return {
    change: Math.round(change * 100) / 100,
    changePct: Math.round(changePct * 10) / 10,
  };
}

export function buildSnapshotPayload(assetsBreakdown, liabilitiesBreakdown, snapshotDate) {
  const totalAssets = sumBreakdown(assetsBreakdown);
  const totalLiabilities = sumBreakdown(liabilitiesBreakdown);

  return {
    total_assets: totalAssets,
    total_liabilities: totalLiabilities,
    net_worth: computeNetWorth(totalAssets, totalLiabilities),
    snapshot_date: snapshotDate,
    assets_breakdown: assetsBreakdown,
    liabilities_breakdown: liabilitiesBreakdown,
  };
}

export const ASSET_CATEGORIES = [
  { id: 'cash', label: 'Cash & Savings' },
  { id: 'investments', label: 'Investments' },
  { id: 'property', label: 'Property' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'other_assets', label: 'Other Assets' },
];

export const LIABILITY_CATEGORIES = [
  { id: 'loans', label: 'Loans' },
  { id: 'credit_cards', label: 'Credit Card Debt' },
  { id: 'other_debts', label: 'Other Debts' },
];
