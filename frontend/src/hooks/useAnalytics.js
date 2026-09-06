import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboard,
  fetchCashflow,
  fetchCategoryBreakdown,
  fetchMonthlyComparison,
  clearAnalytics,
} from '@/store/analyticsSlice';

export function useAnalytics(autoFetchDashboard = false) {
  const dispatch = useDispatch();
  const dashboard = useSelector((s) => s.analytics.dashboard);
  const cashflow = useSelector((s) => s.analytics.cashflow);
  const categories = useSelector((s) => s.analytics.categories);
  const monthly = useSelector((s) => s.analytics.monthly);
  const loading = useSelector((s) => s.analytics.loading);
  const error = useSelector((s) => s.analytics.error);

  useEffect(() => {
    if (autoFetchDashboard) dispatch(fetchDashboard());
  }, [autoFetchDashboard, dispatch]);

  return {
    dashboard,
    cashflow,
    categories,
    monthly,
    loading,
    error,
    fetchDashboard: useCallback(() => dispatch(fetchDashboard()), [dispatch]),
    fetchCashflow: useCallback((m) => dispatch(fetchCashflow(m)), [dispatch]),
    fetchCategories: useCallback(
      (from, to) => dispatch(fetchCategoryBreakdown({ dateFrom: from, dateTo: to })),
      [dispatch],
    ),
    fetchMonthly: useCallback((y) => dispatch(fetchMonthlyComparison(y)), [dispatch]),
    clearAnalytics: useCallback(() => dispatch(clearAnalytics()), [dispatch]),
  };
}

export default useAnalytics;
