import {
  CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from 'recharts';
import {
  AXIS_PROPS, CHART_ANIMATION, CHART_COLORS, CHART_MARGIN, DEFAULT_CHART_HEIGHT, GRID_PROPS, TOOLTIP_PROPS,
} from '@/constants/chartConfig';
import { getCategoryById } from '@/constants/categories';
import CurrencyDisplay from '@/components/common/CurrencyDisplay';

const SEVERITY_COLORS = { low: CHART_COLORS.warning, medium: CHART_COLORS.primary, high: CHART_COLORS.danger };

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3 text-sm shadow-md">
      <p className="font-medium">{item.description}</p>
      <p className="text-muted">{getCategoryById(item.category)?.label}</p>
      <p><CurrencyDisplay amount={item.amount} /> · z={item.z_score?.toFixed(2)}</p>
    </div>
  );
}

export default function AnomalyScatterPlot({ data = [], height = DEFAULT_CHART_HEIGHT, className }) {
  if (!data.length) {
    return <div className={className} style={{ height }}><p className="flex h-full items-center justify-center text-sm text-muted">No anomaly data</p></div>;
  }

  const groups = ['low', 'medium', 'high'].map((severity) => ({
    severity,
    points: data.filter((d) => d.anomaly_severity === severity),
  }));

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={CHART_MARGIN}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis type="number" dataKey="amount" name="Amount" {...AXIS_PROPS} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <YAxis type="number" dataKey="z_score" name="Z-Score" {...AXIS_PROPS} />
          <ZAxis range={[60, 400]} />
          <Tooltip content={<ScatterTooltip />} {...TOOLTIP_PROPS} />
          {groups.map(({ severity, points }) => points.length > 0 && (
            <Scatter key={severity} name={severity} data={points} animationDuration={CHART_ANIMATION.duration}>
              {points.map((p) => <Cell key={p.id} fill={SEVERITY_COLORS[severity] ?? CHART_COLORS.muted} />)}
            </Scatter>
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
