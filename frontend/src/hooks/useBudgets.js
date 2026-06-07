import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBudgets,
  fetchBudgetSummary,
  createBudget,
  updateBudget,
  deleteBudget,
  setMonthYear,
} from '@/store/budgetSlice';

export function useBudgets(autoFetch = true) {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.budgets.items);
  const summary = useSelector((s) => s.budgets.summary);
  const month = useSelector((s) => s.budgets.month);
  const year = useSelector((s) => s.budgets.year);
  const loading = useSelector((s) => s.budgets.loading);
  const error = useSelector((s) => s.budgets.error);

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchBudgets({ month, year }));
      dispatch(fetchBudgetSummary({ month, year }));
    }
  }, [autoFetch, dispatch, month, year]);

  return {
    items,
    summary,
    month,
    year,
    loading,
    error,
    fetch: useCallback(() => {
      dispatch(fetchBudgets({ month, year }));
      dispatch(fetchBudgetSummary({ month, year }));
    }, [dispatch, month, year]),
    create: useCallback((d) => dispatch(createBudget(d)), [dispatch]),
    update: useCallback((id, d) => dispatch(updateBudget({ id, data: d })), [dispatch]),
    remove: useCallback((id) => dispatch(deleteBudget(id)), [dispatch]),
    setMonthYear: useCallback((m, y) => dispatch(setMonthYear({ month: m, year: y })), [dispatch]),
  };
}

export default useBudgets;
