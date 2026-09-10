import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import analyticsApi from '@/api/analyticsApi';
import {
  AXIS_PROPS, CHART_COLORS, CHART_MARGIN, GRID_PROPS, TOOLTIP_PROPS,
} from '@/constants/chartConfig';
import { useDateRange } from '@/hooks/useDateRange';
import { filterSeriesByDateRange } from '@/utils/dateRangeMonths';
import { isIncompleteSavingsMonth } from '@/utils/savingsRate';

function SavingsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const incomplete = isIncompleteSavingsMonth(d);
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      {Number(d.income) <= 0 ? (
        <p className="text-muted">No income recorded</p>
      ) : incomplete ? (
        <p className="text-muted">Incomplete data — no expenses logged ({d.rate}%)</p>
      ) : (
        <p className={d.rate >= 20 ? 'text-success' : d.rate >= 0 ? 'text-warning' : 'text-danger'}>
          Savings rate: {d.rate}%
        </p>
      )}
    </div>
  );
}

export default function SavingsRateChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { from, to } = useDateRange();

  useEffect(() => {
    analyticsApi.savingsRate().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => filterSeriesByDateRange(data, from, to),
    [data, from, to],
  );

  const latest = filtered[filtered.length - 1];
  const latestIncomplete = latest && isIncompleteSavingsMonth(latest);
  const latestNoIncome = latest && Number(latest.income) <= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Savings Rate</CardTitle>
        <p className="text-xs text-muted">
          Monthly savings as a percentage of income
          {latest != null && !latestNoIncome && (
            <span
              className={
                latestIncomplete
                  ? ' text-muted'
                  : latest.rate >= 20
                    ? ' text-success'
                    : latest.rate >= 0
                      ? ' text-warning'
                      : ' text-danger'
              }
            >
              {' · '}
              {latestIncomplete
                ? `Current month incomplete (${latest.rate}%)`
                : `Current month: ${latest.rate}%`}
            </span>
          )}
          {latestNoIncome && (
            <span className=" text-muted">{' · '}No income this month</span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 animate-pulse rounded-lg bg-surface-2" />
        ) : !filtered.length ? (
          <p className="flex h-48 items-center justify-center text-sm text-muted">
            No savings data for this period
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={filtered} margin={CHART_MARGIN}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="label" {...AXIS_PROPS} />
              <YAxis {...AXIS_PROPS} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<SavingsTooltip />} {...TOOLTIP_PROPS} />
              <ReferenceLine
                y={20}
                stroke={CHART_COLORS.success}
                strokeDasharray="4 4"
                label={{ value: '20% goal', fill: CHART_COLORS.axis, fontSize: 10 }}
              />
              <ReferenceLine y={0} stroke={CHART_COLORS.border} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (cx == null || cy == null) return null;
                  const incomplete = isIncompleteSavingsMonth(payload);
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill={incomplete ? CHART_COLORS.muted : CHART_COLORS.primary}
                      stroke={incomplete ? CHART_COLORS.border : CHART_COLORS.primary}
                      strokeDasharray={incomplete ? '2 2' : undefined}
                    />
                  );
                }}
                animationDuration={0}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
