import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SpendingCategoryBar from "@/components/charts/SpendingCategoryBar";
import DateRangePicker from "@/components/common/DateRangePicker";
import { getCategoryById } from "@/constants/categories";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDateRange } from "@/hooks/useDateRange";
import { toISODateString } from "@/utils/formatDate";
import { DEFAULT_CHART_HEIGHT } from "@/constants/chartConfig";

export default function StatisticsSpending() {
  const { from, to, setRange, setLastMonths } = useDateRange();
  const { categories, fetchCategories } = useAnalytics();

  useEffect(() => {
    if (!from || !to) setLastMonths(3);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (from && to) fetchCategories(from, to);
  }, [from, to]); // eslint-disable-line

  return (
    <div className="space-y-4">
      <DateRangePicker
        value={from && to ? { from: new Date(from), to: new Date(to) } : null}
        onChange={(range) =>
          setRange(toISODateString(range.from), toISODateString(range.to))
        }
      />

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
                {categories.slice(0, 8).map((c) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground">
                      {getCategoryById(c.category)?.label ?? c.category.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.percentage}%`,
                            backgroundColor: getCategoryById(c.category)?.color ?? undefined,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted">
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
