/** Month has income but no expenses — rate looks great but data is incomplete. */
export function isIncompleteSavingsMonth(d) {
  return Number(d?.income) > 0 && Number(d?.expenses) === 0;
}

/** Prefer months with real expense activity when ranking "best" savings rate. */
export function completeSavingsMonths(data = []) {
  return data.filter((d) => !isIncompleteSavingsMonth(d));
}
