import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import CashFlowBar from "@/features/statistics/CashFlowBar";
import MonthOverview from "@/features/dashboard/MonthOverview";
import StatisticsOverview from "@/features/statistics/StatisticsOverview";
import StatisticsSpending from "@/features/statistics/StatisticsSpending";
import SpendingClusters from "@/features/statistics/SpendingClusters";
import SavingsRateChart from "@/features/statistics/SavingsRateChart";
import SavingsSummaryCards from "@/features/statistics/SavingsSummaryCards";
import { ROUTES } from "@/constants/routes";

const SECTION_META = {
  [ROUTES.STATISTICS_OVERVIEW]: {
    title: "Overview",
    description: "Income, expenses, and monthly trends.",
  },
  [ROUTES.STATISTICS_SPENDING]: {
    title: "Spending",
    description: "See where your money goes by category.",
  },
  [ROUTES.STATISTICS_SAVINGS]: {
    title: "Savings",
    description: "Track how much you save each month.",
  },
};

export default function StatisticsPage() {
  const location = useLocation();
  const dashboard = useSelector((s) => s.analytics.dashboard);
  const meta = SECTION_META[location.pathname] ?? SECTION_META[ROUTES.STATISTICS_OVERVIEW];

  if (location.pathname === ROUTES.STATISTICS) {
    return <Navigate to={ROUTES.STATISTICS_OVERVIEW} replace />;
  }

  const showCashFlow =
    location.pathname === ROUTES.STATISTICS_OVERVIEW ||
    location.pathname === ROUTES.STATISTICS_SPENDING;

  return (
    <div className="space-y-5">
      <PageHeader title={meta.title} description={meta.description} />
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
    <>
      <StatisticsSpending />
      <SpendingClusters />
    </>
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
