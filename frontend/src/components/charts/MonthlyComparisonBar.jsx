import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AXIS_PROPS, BAR_RADIUS, CHART_ANIMATION, CHART_COLORS, CHART_MARGIN, DEFAULT_CHART_HEIGHT,
  EXPENSE_COLOR, GRID_PROPS, INCOME_COLOR, TOOLTIP_PROPS,
} from '@/constants/chartConfig';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm shadow-md">
      <p className="mb-2 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}</span>
          <CurrencyDisplay amount={entry.value} />
        </p>
      ))}
    </div>
  );
}

export default function MonthlyComparisonBar({ data = [], height = DEFAULT_CHART_HEIGHT, className }) {
  if (!data.length) {
    return <div className={className} style={{ height }}><p className="flex h-full items-center justify-center text-sm text-muted">No monthly data</p></div>;
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="month" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<BarTooltip />} {...TOOLTIP_PROPS} />
          <Legend wrapperStyle={{ color: CHART_COLORS.foreground }} />
          <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={BAR_RADIUS} animationDuration={CHART_ANIMATION.duration} />
          <Bar dataKey="expenses" name="Expenses" fill={EXPENSE_COLOR} radius={BAR_RADIUS} animationDuration={CHART_ANIMATION.duration} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
