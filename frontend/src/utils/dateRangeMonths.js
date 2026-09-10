import {
  differenceInCalendarMonths,
  endOfMonth,
  parse,
  parseISO,
  startOfMonth,
} from 'date-fns';

/** How many calendar months the range spans (inclusive). */
export function monthsInRange(from, to) {
  if (!from || !to) return 6;
  const start = startOfMonth(typeof from === 'string' ? parseISO(from) : from);
  const end = startOfMonth(typeof to === 'string' ? parseISO(to) : to);
  return Math.max(1, differenceInCalendarMonths(end, start) + 1);
}

/** Months back from today needed to cover `from` (for rolling cashflow fetch). */
export function monthsBackToCover(from) {
  if (!from) return 6;
  const start = startOfMonth(typeof from === 'string' ? parseISO(from) : from);
  return Math.max(1, differenceInCalendarMonths(startOfMonth(new Date()), start) + 1);
}

/**
 * Filter cashflow / savings points whose month label ("Sep 26") or
 * month+year fields fall within [from, to].
 */
export function filterSeriesByDateRange(data = [], from, to) {
  if (!from || !to || !data.length) return data;
  const start = startOfMonth(typeof from === 'string' ? parseISO(from) : from);
  const end = endOfMonth(typeof to === 'string' ? parseISO(to) : to);

  return data.filter((d) => {
    let point;
    if (d.year != null && d.month != null) {
      point = new Date(d.year, d.month - 1, 1);
    } else if (d.month && typeof d.month === 'string') {
      point = parse(d.month, 'MMM yy', new Date());
      if (Number.isNaN(point.getTime())) point = parse(d.month, 'MMM', new Date());
    } else {
      return true;
    }
    return point >= start && point <= end;
  });
}
