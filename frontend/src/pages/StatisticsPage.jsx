import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import DateRangePicker from "@/components/common/DateRangePicker";
import CashFlowBar from "@/features/statistics/CashFlowBar";
import MonthOverview from "@/features/dashboard/MonthOverview";
import StatisticsOverview from "@/features/statistics/StatisticsOverview";
import StatisticsSpending from "@/features/statistics/StatisticsSpending";
import SpendingClusters from "@/features/statistics/SpendingClusters";
import UnusualTransactionsPanel from "@/features/statistics/UnusualTransactionsPanel";
import SavingsRateChart from "@/features/statistics/SavingsRateChart";
import SavingsSummaryCards from "@/features/statistics/SavingsSummaryCards";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDateRange } from "@/hooks/useDateRange";
import { toISODateString } from "@/utils/formatDate";
import { ROUTES } from "@/constants/routes";

const SECTION_META = {
  [ROUTES.STATISTICS_OVERVIEW]: {
    title: "Overview",
    description: "Income, expenses, and monthly trends.",
  },
  [ROUTES.STATISTICS_SPENDING]: {
    title: "Spending",
    description: "Category breakdown, spending groups, and unusual expenses.",
  },
  [ROUTES.STATISTICS_SAVINGS]: {
    title: "Savings",
    description: "Track how much you save each month.",
  },
};

export default function StatisticsPage() {
  const location = useLocation();
  const { dashboard } = useAnalytics(true);
  const { from, to, setRange, setLastMonths } = useDateRange();
  const meta = SECTION_META[location.pathname] ?? SECTION_META[ROUTES.STATISTICS_OVERVIEW];

  useEffect(() => {
    if (!from || !to) setLastMonths(6);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (location.pathname === ROUTES.STATISTICS) {
    return <Navigate to={ROUTES.STATISTICS_OVERVIEW} replace />;
  }

  const showCashFlow =
    location.pathname === ROUTES.STATISTICS_OVERVIEW ||
    location.pathname === ROUTES.STATISTICS_SPENDING;

  return (
    <div className="space-y-5">
      <PageHeader
        title={meta.title}
        description={meta.description}
        action={
          <DateRangePicker
            value={from && to ? { from: new Date(from), to: new Date(to) } : null}
            onChange={(range) =>
              setRange(toISODateString(range.from), toISODateString(range.to))
            }
          />
        }
      />
      {showCashFlow && (
        <CashFlowBar
          income={dashboard?.income ?? dashboard?.total_income ?? 0}
          expenses={dashboard?.expenses ?? dashboard?.total_expenses ?? 0}
        />
      )}
      <Outlet />
    </div>
  );
}

export function StatisticsOverviewRoute() {
  return (
    <>
      <MonthOverview />
      <StatisticsOverview />
    </>
  );
}

export function StatisticsSpendingRoute() {
  return (
    <div className="space-y-5">
      <StatisticsSpending />
      <SpendingClusters />
      <UnusualTransactionsPanel period="this_month" />
    </div>
  );
}

export function StatisticsSavingsRoute() {
  return (
    <div className="space-y-5">
      <SavingsSummaryCards />
      <SavingsRateChart />
    </div>
  );
}
