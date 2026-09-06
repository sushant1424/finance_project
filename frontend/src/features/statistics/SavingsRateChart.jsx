import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import analyticsApi from '@/api/analyticsApi';
import {
  AXIS_PROPS, CHART_COLORS, CHART_MARGIN, GRID_PROPS, TOOLTIP_PROPS,
} from '@/constants/chartConfig';

function SavingsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className={d.rate >= 20 ? 'text-success' : d.rate >= 0 ? 'text-warning' : 'text-danger'}>
        Savings rate: {d.rate}%
      </p>
    </div>
  );
}

export default function SavingsRateChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.savingsRate().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const latest = data[data.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Savings Rate</CardTitle>
        <p className="text-xs text-muted">
          Monthly savings as a percentage of income over the last 12 months
          {latest != null && (
            <span className={latest.rate >= 20 ? ' text-success' : latest.rate >= 0 ? ' text-warning' : ' text-danger'}>
              {' · '}Current month: {latest.rate}%
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 animate-pulse rounded-lg bg-surface-2" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={CHART_MARGIN}>
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
                dot={{ fill: CHART_COLORS.primary, r: 3 }}
                animationDuration={0}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
