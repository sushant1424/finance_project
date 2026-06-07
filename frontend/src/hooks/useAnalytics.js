import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import analyticsApi from '@/api/analyticsApi';
import {
  fetchDashboard,
  fetchInsights,
  fetchCashflow,
  fetchCategoryBreakdown,
  fetchMonthlyComparison,
  fetchSpendingTrend,
  setTrendAlpha,
  clearAnalytics,
} from '@/store/analyticsSlice';

export function useAnalytics(autoFetchDashboard = false, autoFetchInsights = false) {
  const dispatch = useDispatch();
  const dashboard = useSelector((s) => s.analytics.dashboard);
  const insights = useSelector((s) => s.analytics.insights);
  const cashflow = useSelector((s) => s.analytics.cashflow);
  const categories = useSelector((s) => s.analytics.categories);
  const monthly = useSelector((s) => s.analytics.monthly);
  const trend = useSelector((s) => s.analytics.trend);
  const trendAlpha = useSelector((s) => s.analytics.trendAlpha);
  const loading = useSelector((s) => s.analytics.loading);
  const error = useSelector((s) => s.analytics.error);

  useEffect(() => {
    if (autoFetchDashboard) dispatch(fetchDashboard());
  }, [autoFetchDashboard, dispatch]);

  useEffect(() => {
    if (autoFetchInsights) dispatch(fetchInsights());
  }, [autoFetchInsights, dispatch]);

  return {
    dashboard,
    insights,
    cashflow,
    categories,
    monthly,
    trend,
    trendAlpha,
    loading,
    error,
    fetchDashboard: useCallback(() => dispatch(fetchDashboard()), [dispatch]),
    fetchInsights: useCallback(() => dispatch(fetchInsights()), [dispatch]),
    fetchCashflow: useCallback((m) => dispatch(fetchCashflow(m)), [dispatch]),
    fetchCategories: useCallback(
      (from, to) => dispatch(fetchCategoryBreakdown({ dateFrom: from, dateTo: to })),
      [dispatch],
    ),
    fetchMonthly: useCallback((y) => dispatch(fetchMonthlyComparison(y)), [dispatch]),
    fetchTrend: useCallback(
      (from, to, alpha) => dispatch(fetchSpendingTrend({ dateFrom: from, dateTo: to, alpha })),
      [dispatch],
    ),
    setTrendAlpha: useCallback((a) => dispatch(setTrendAlpha(a)), [dispatch]),
    clearAnalytics: useCallback(() => dispatch(clearAnalytics()), [dispatch]),
    fetchDayOfWeek: useCallback((from, to) => analyticsApi.dayOfWeek(from, to), []),
  };
}

export default useAnalytics;
