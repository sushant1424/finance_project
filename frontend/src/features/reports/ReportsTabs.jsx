import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DateRangePicker from '@/components/common/DateRangePicker';
import SpendingCategoryPie from '@/components/charts/SpendingCategoryPie';
import MonthlyComparisonBar from '@/components/charts/MonthlyComparisonBar';
import SpendingTrendLine from '@/components/charts/SpendingTrendLine';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDateRange } from '@/hooks/useDateRange';
import { usePDF } from '@/hooks/usePDF';
import { useConfirm } from '@/components/common/ConfirmProvider';
import ReportsSummary from '@/features/reports/ReportsSummary';
import { DEFAULT_CHART_HEIGHT } from '@/constants/chartConfig';
import { toISODateString } from '@/utils/formatDate';

export default function ReportsTabs() {
  const { from, to, setRange, setLastMonths } = useDateRange();
  const { categories, monthly, trend, fetchCategories, fetchMonthly, fetchTrend } = useAnalytics();
  const { ref, exporting, exportPDF } = usePDF();
  const confirm = useConfirm();

  useEffect(() => { setLastMonths(6); }, [setLastMonths]);

  useEffect(() => {
    if (from && to) {
      fetchCategories(toISODateString(from), toISODateString(to));
      fetchTrend(toISODateString(from), toISODateString(to));
    }
    fetchMonthly(new Date().getFullYear());
  }, [from, to, fetchCategories, fetchTrend, fetchMonthly]);

  const handleExport = async () => {
    const ok = await confirm({ title: 'Export PDF?', description: 'Download report for current view.', confirmLabel: 'Export' });
    if (!ok) return;
    exportPDF('finsight-report.pdf', { title: 'FinSight Report', dateRange: from && to ? `${toISODateString(from)} – ${toISODateString(to)}` : '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DateRangePicker value={{ from: from ? new Date(from) : null, to: to ? new Date(to) : null }} onChange={setRange} />
        <Button onClick={handleExport} disabled={exporting}>{exporting ? 'Exporting…' : 'Export PDF'}</Button>
      </div>
      <ReportsSummary monthly={monthly} />
      <div ref={ref}>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Card><CardHeader><CardTitle>Category breakdown</CardTitle></CardHeader>
              <CardContent><SpendingCategoryPie data={categories} height={DEFAULT_CHART_HEIGHT} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="spending" className="mt-4">
            <Card><CardHeader><CardTitle>Monthly expenses</CardTitle></CardHeader>
              <CardContent><MonthlyComparisonBar data={monthly} height={DEFAULT_CHART_HEIGHT} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="income" className="mt-4">
            <Card><CardHeader><CardTitle>Monthly comparison</CardTitle></CardHeader>
              <CardContent><MonthlyComparisonBar data={monthly} height={DEFAULT_CHART_HEIGHT} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="trends" className="mt-4">
            <Card><CardHeader><CardTitle>Spending trend (EWMA)</CardTitle></CardHeader>
              <CardContent><SpendingTrendLine data={trend} height={DEFAULT_CHART_HEIGHT} /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
