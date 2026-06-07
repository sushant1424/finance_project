import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AXIS_PROPS, CHART_ANIMATION, CHART_COLORS, CHART_MARGIN, DEFAULT_CHART_HEIGHT,
  EXPENSE_COLOR, EXPENSE_FILL, GRID_PROPS, INCOME_COLOR, INCOME_FILL, TOOLTIP_PROPS,
} from '@/constants/chartConfig';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';

function CashFlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm shadow-md">
      <p className="mb-2 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="flex justify-between gap-4">
          <span>{entry.name}</span>
          <CurrencyDisplay amount={entry.value} />
        </p>
      ))}
    </div>
  );
}

export default function CashFlowAreaChart({ data = [], height = DEFAULT_CHART_HEIGHT, className }) {
  if (!data.length) {
    return <div className={className} style={{ height }}><p className="flex h-full items-center justify-center text-sm text-muted">No cash flow data</p></div>;
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="month" {...AXIS_PROPS} />
          <YAxis {...AXIS_PROPS} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CashFlowTooltip />} {...TOOLTIP_PROPS} />
          <Legend wrapperStyle={{ color: CHART_COLORS.foreground }} />
          <Area type="monotone" dataKey="income" name="Income" stroke={INCOME_COLOR} fill={INCOME_FILL} animationDuration={CHART_ANIMATION.duration} />
          <Area type="monotone" dataKey="expenses" name="Expenses" stroke={EXPENSE_COLOR} fill={EXPENSE_FILL} animationDuration={CHART_ANIMATION.duration} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
