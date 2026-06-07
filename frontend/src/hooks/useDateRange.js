import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from '@/store/uiSlice';
import { toISODateString } from '@/utils/formatDate';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

export function useDateRange() {
  const dispatch = useDispatch();
  const dateRange = useSelector((s) => s.ui.dateRange);

  const setRange = useCallback(
    (fromOrRange, to) => {
      if (fromOrRange && typeof fromOrRange === 'object' && 'from' in fromOrRange) {
        dispatch(setDateRange({
          from: toISODateString(fromOrRange.from),
          to: toISODateString(fromOrRange.to),
        }));
      } else {
        dispatch(setDateRange({ from: fromOrRange, to }));
      }
    },
    [dispatch],
  );

  const setLastMonths = useCallback(
    (months = 6) => {
      const to = toISODateString(endOfMonth(new Date()));
      const from = toISODateString(startOfMonth(subMonths(new Date(), months - 1)));
      dispatch(setDateRange({ from, to }));
    },
    [dispatch],
  );

  return {
    from: dateRange.from,
    to: dateRange.to,
    dateRange,
    setRange,
    setLastMonths,
    clear: useCallback(() => dispatch(setDateRange({ from: null, to: null })), [dispatch]),
  };
}

export default useDateRange;
