import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AXIS_PROPS, CHART_ANIMATION, CHART_COLORS, CHART_MARGIN, DEFAULT_CHART_HEIGHT,
  GRID_PROPS, TOOLTIP_PROPS,
} from '@/constants/chartConfig';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';
import { formatDate } from '@/utils/formatDate';

function NetWorthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm shadow-md">
      <p className="mb-2 font-medium">{formatDate(label)}</p>
      <p className="text-primary"><CurrencyDisplay amount={payload[0].value} /></p>
    </div>
  );
}

export default function NetWorthChart({ data = [], height = DEFAULT_CHART_HEIGHT, className }) {
  if (!data.length) {
    return <div className={className} style={{ height }}><p className="flex h-full items-center justify-center text-sm text-muted">No net worth history</p></div>;
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="date" {...AXIS_PROPS} tickFormatter={(v) => formatDate(v)} />
          <YAxis {...AXIS_PROPS} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<NetWorthTooltip />} {...TOOLTIP_PROPS} />
          <Area
            type="monotone"
            dataKey="net_worth"
            name="Net Worth"
            stroke={CHART_COLORS.primary}
            fill="url(#netWorthFill)"
            animationDuration={CHART_ANIMATION.duration}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
