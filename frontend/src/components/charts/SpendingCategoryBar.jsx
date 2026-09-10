import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AXIS_PROPS, BAR_RADIUS, CHART_ANIMATION, CHART_COLORS, CHART_MARGIN,
  DEFAULT_CHART_HEIGHT, GRID_PROPS, TOOLTIP_PROPS,
} from '@/constants/chartConfig';
import { useResolveCategory } from '@/hooks/useResolveCategory';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';

/** When one category is this dominant, bars for the rest become unreadable. */
const DOMINANCE_PCT = 70;

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

function CategoryList({ chartData }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        One category dominates this period — showing a list so smaller categories stay visible.
      </p>
      <div className="space-y-2">
        {chartData.map((c) => (
          <div
            key={c.category}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2/40 px-3 py-2 text-sm"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: c.fill }}
              />
              <span className="truncate font-medium text-foreground">{c.label}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3 tabular-nums">
              <CurrencyDisplay amount={c.amount} />
              <span className="w-12 text-right text-muted">{c.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SpendingCategoryBar({ data = [], height = DEFAULT_CHART_HEIGHT, className }) {
  const resolve = useResolveCategory();

  if (!data.length) {
    return (
      <div className={className} style={{ height }}>
        <p className="flex h-full items-center justify-center text-sm text-muted">No category data</p>
      </div>
    );
  }

  const chartData = [...data]
    .sort((a, b) => b.amount - a.amount)
    .map((d) => {
      const meta = resolve(d.category);
      return {
        ...d,
        label: meta.label,
        fill: meta.color || CHART_COLORS.muted,
      };
    });

  const topPct = chartData[0]?.percentage ?? 0;
  if (topPct >= DOMINANCE_PCT && chartData.length > 1) {
    return (
      <div className={className} style={{ minHeight: height }}>
        <CategoryList chartData={chartData} />
      </div>
    );
  }

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
