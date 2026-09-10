import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonthlyComparisonBar from "@/components/charts/MonthlyComparisonBar";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDateRange } from "@/hooks/useDateRange";
import { DEFAULT_CHART_HEIGHT } from "@/constants/chartConfig";
import {
  filterSeriesByDateRange,
  monthsBackToCover,
  monthsInRange,
} from "@/utils/dateRangeMonths";

export default function StatisticsOverview() {
  const { from, to } = useDateRange();
  const { cashflow, fetchCashflow } = useAnalytics();

  const backMonths = monthsBackToCover(from);
  const spanMonths = monthsInRange(from, to);

  useEffect(() => {
    if (!from || !to) return;
    fetchCashflow(Math.min(24, Math.max(backMonths, spanMonths)));
  }, [from, to, backMonths, spanMonths, fetchCashflow]);

  const chartData = useMemo(
    () => filterSeriesByDateRange(cashflow, from, to),
    [cashflow, from, to],
  );

  const subtitle =
    spanMonths === 1
      ? "Selected month"
      : `Last ${spanMonths} months at a glance`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Monthly income vs expenses</CardTitle>
        <p className="text-xs text-muted">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <MonthlyComparisonBar data={chartData} height={DEFAULT_CHART_HEIGHT} />
      </CardContent>
    </Card>
  );
}
