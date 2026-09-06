import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MonthlyComparisonBar from "@/components/charts/MonthlyComparisonBar";
import { useAnalytics } from "@/hooks/useAnalytics";
import { DEFAULT_CHART_HEIGHT } from "@/constants/chartConfig";

export default function StatisticsOverview() {
  const { monthly, fetchMonthly } = useAnalytics();
  const now = new Date();

  useEffect(() => {
    fetchMonthly(now.getFullYear());
  }, []); // eslint-disable-line

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Monthly income vs expenses</CardTitle>
        <p className="text-xs text-muted">Last 6 months at a glance</p>
      </CardHeader>
      <CardContent>
        <MonthlyComparisonBar data={monthly} height={DEFAULT_CHART_HEIGHT} />
      </CardContent>
    </Card>
  );
}
