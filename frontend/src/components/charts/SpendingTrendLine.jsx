import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AXIS_PROPS, CHART_ANIMATION, CHART_COLORS, CHART_MARGIN, DEFAULT_CHART_HEIGHT,
  EXPENSE_COLOR, GRID_PROPS, TOOLTIP_PROPS,
} from '@/constants/chartConfig';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { formatDate } from '@/utils/formatDate';

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm shadow-md">
      <p className="mb-2 font-medium">{formatDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}</span>
          <CurrencyDisplay amount={entry.value} />
        </p>
      ))}
    </div>
  );
}

export default function SpendingTrendLine({ data = [], height = DEFAULT_CHART_HEIGHT, className }) {
  const daily = data.daily ?? data;
  if (!daily?.length) {
    return <div className={className} style={{ height }}><p className="flex h-full items-center justify-center text-sm text-muted">No trend data</p></div>;
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={daily} margin={CHART_MARGIN}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="date" {...AXIS_PROPS} tickFormatter={(v) => formatDate(v, 'YYYY-MM-DD').slice(5)} />
          <YAxis {...AXIS_PROPS} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<TrendTooltip />} {...TOOLTIP_PROPS} />
          <Legend wrapperStyle={{ color: CHART_COLORS.foreground }} />
          <Line type="monotone" dataKey="amount" name="Daily spend" stroke={EXPENSE_COLOR} dot={false} strokeWidth={2} animationDuration={CHART_ANIMATION.duration} />
          <Line type="monotone" dataKey="ewma" name="EWMA trend" stroke={CHART_COLORS.primary} dot={false} strokeWidth={2} strokeDasharray="4 4" animationDuration={CHART_ANIMATION.duration} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
