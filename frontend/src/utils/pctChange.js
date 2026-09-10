/** Percent change from previous to current. Returns null when previous is missing/zero. */
export function pctChange(current, previous) {
  if (previous == null || previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

export default pctChange;
