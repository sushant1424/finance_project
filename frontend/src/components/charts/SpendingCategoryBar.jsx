import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AXIS_PROPS, BAR_RADIUS, CHART_ANIMATION, CHART_COLORS, CHART_MARGIN,
  DEFAULT_CHART_HEIGHT, GRID_PROPS, TOOLTIP_PROPS,
} from '@/constants/chartConfig';
import { getCategoryById } from '@/constants/categories';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm shadow-md">
      <p className="font-medium">{item.label}</p>
      <p className="text-muted">
        <CurrencyDisplay amount={item.amount} /> · {item.percentage}%
      </p>
    </div>
  );
}

export default function SpendingCategoryBar({ data = [], height = DEFAULT_CHART_HEIGHT, className }) {
  if (!data.length) {
    return (
      <div className={className} style={{ height }}>
        <p className="flex h-full items-center justify-center text-sm text-muted">No category data</p>
      </div>
    );
  }

  const chartData = [...data]
    .sort((a, b) => b.amount - a.amount)
    .map((d) => ({
      ...d,
      label: getCategoryById(d.category)?.label ?? d.category,
      fill: getCategoryById(d.category)?.color ?? CHART_COLORS.muted,
    }));

  return (
    <div className={className} style={{ height, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ ...CHART_MARGIN, left: 8, right: 16 }}>
          <CartesianGrid {...GRID_PROPS} horizontal={false} />
          <XAxis type="number" {...AXIS_PROPS} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <YAxis
            type="category"
            dataKey="label"
            {...AXIS_PROPS}
            width={100}
            tick={{ ...AXIS_PROPS.tick, fontSize: 11 }}
          />
          <Tooltip content={<BarTooltip />} {...TOOLTIP_PROPS} />
          <Bar dataKey="amount" radius={BAR_RADIUS} animationDuration={CHART_ANIMATION.duration}>
            {chartData.map((entry) => (
              <Cell key={entry.category} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
