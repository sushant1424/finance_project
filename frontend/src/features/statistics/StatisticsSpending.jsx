import { useEffect } from "react";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SpendingCategoryBar from "@/components/charts/SpendingCategoryBar";
import CurrencyDisplay from "@/components/common/CurrencyDisplay";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDateRange } from "@/hooks/useDateRange";
import { useResolveCategory } from "@/hooks/useResolveCategory";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { DEFAULT_CHART_HEIGHT } from "@/constants/chartConfig";
import { downloadCsv, rowsToCsv } from "@/utils/downloadCsv";

export default function StatisticsSpending() {
  const { from, to } = useDateRange();
  const { categories, fetchCategories } = useAnalytics();
  const resolve = useResolveCategory();
  const confirm = useConfirm();

  useEffect(() => {
    if (from && to) fetchCategories(from, to);
  }, [from, to]); // eslint-disable-line

  const handleExport = async () => {
    if (!categories.length) {
      toast.error("No spending data to export");
      return;
    }
    const ok = await confirm({
      title: "Export spending report?",
      description: "Download category totals for the selected period as CSV.",
      confirmLabel: "Export",
    });
    if (!ok) return;

    const sorted = [...categories].sort((a, b) => b.amount - a.amount);
    const headers = ["Category", "Total Spent", "% of total"];
    const rows = sorted.map((c) => [
      resolve(c.category).label,
      c.amount,
      c.percentage,
    ]);
    const stamp = from && to ? `${from}_to_${to}` : "report";
    downloadCsv(`spending-by-category-${stamp}.csv`, rowsToCsv(headers, rows));
    toast.success("Spending report downloaded");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={!categories.length}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Spending by category</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingCategoryBar data={categories} height={DEFAULT_CHART_HEIGHT} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top categories</CardTitle>
          </CardHeader>
          <CardContent>
            {!categories.length ? (
              <p className="py-8 text-center text-sm text-muted">
                No spending data for this period.
              </p>
            ) : (
              <div className="space-y-2">
                {[...categories]
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 8)
                  .map((c) => {
                    const meta = resolve(c.category);
                    return (
                      <div
                        key={c.category}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">{meta.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="tabular-nums text-muted">
                            <CurrencyDisplay amount={c.amount} />
                          </span>
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${c.percentage}%`,
                                backgroundColor: meta.color,
                              }}
                            />
                          </div>
                          <span className="w-8 text-right text-muted">
                            {c.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
