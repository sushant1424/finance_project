import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  CHART_ANIMATION, CHART_COLORS, DEFAULT_CHART_HEIGHT, PIE_INNER_RADIUS, PIE_OUTER_RADIUS, TOOLTIP_PROPS,
} from '@/constants/chartConfig';
import { getCategoryById } from '@/constants/categories';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm shadow-md">
      <p className="font-medium">{getCategoryById(item.category)?.label ?? item.category}</p>
      <p className="text-muted"><CurrencyDisplay amount={item.amount} /> · {item.percentage}%</p>
    </div>
  );
}

export default function SpendingCategoryPie({ data = [], height = DEFAULT_CHART_HEIGHT, className }) {
  if (!data.length) {
    return <div className={className} style={{ height }}><p className="flex h-full items-center justify-center text-sm text-muted">No category data</p></div>;
  }

  const chartData = data.map((d) => ({ ...d, fill: getCategoryById(d.category)?.color ?? CHART_COLORS.muted }));

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={PIE_INNER_RADIUS}
            outerRadius={PIE_OUTER_RADIUS}
            paddingAngle={2}
            animationDuration={CHART_ANIMATION.duration}
          >
            {chartData.map((entry) => <Cell key={entry.category} fill={entry.fill} stroke={CHART_COLORS.surface} />)}
          </Pie>
          <Tooltip content={<PieTooltip />} {...TOOLTIP_PROPS} />
          <Legend formatter={(value) => getCategoryById(value)?.label ?? value} wrapperStyle={{ color: CHART_COLORS.foreground }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
