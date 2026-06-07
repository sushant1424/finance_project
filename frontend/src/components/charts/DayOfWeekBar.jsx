import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_PROPS, CHART_ANIMATION, CHART_MARGIN, DEFAULT_CHART_HEIGHT, EXPENSE_COLOR, GRID_PROPS, TOOLTIP_PROPS } from '@/constants/chartConfig';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';

function DayTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <CurrencyDisplay amount={payload[0].value} className="text-expense" />
    </div>
  );
}

export default function DayOfWeekBar({ data = [], height = DEFAULT_CHART_HEIGHT, className }) {
  if (!data.length || data.every((d) => !d.amount)) {
    return (
      <div className={className} style={{ height }}>
        <p className="flex h-full items-center justify-center text-sm text-muted">No spending data yet</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="day" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<DayTooltip />} {...TOOLTIP_PROPS} />
          <Bar dataKey="amount" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} animationDuration={CHART_ANIMATION.duration} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
