export function normalizePace(pace) {
  if (!pace) return null;
  return {
    status: pace.status,
    projectedSpend: pace.projected_spend ?? pace.projectedSpend ?? 0,
    pacePct: pace.pace_pct ?? pace.pacePct ?? 0,
    daysUntilExceeded: pace.days_until_exceeded ?? pace.daysUntilExceeded ?? null,
  };
}

export function getPaceLabel(status) {
  const labels = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    will_exceed: 'Will Exceed',
    exceeded: 'Exceeded',
  };
  return labels[status] ?? 'On Track';
}

export function getUtilizationColor(pct) {
  if (pct >= 100) return '#ef4444';
  if (pct >= 80) return '#f97316';
  if (pct >= 60) return '#f59e0b';
  return '#22c55e';
}
