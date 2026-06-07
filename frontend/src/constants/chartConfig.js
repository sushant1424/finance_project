export const CHART_COLORS = {
  background: 'transparent',
  grid: '#3f3f46',
  axis: '#71717a',
  foreground: '#fafafa',
  primary: '#06b6d4',
  purple: '#a855f7',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  muted: '#71717a',
  surface: '#18181b',
  border: '#3f3f46',
};

export const GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: CHART_COLORS.grid,
  vertical: false,
};

export const AXIS_TICK = { fill: CHART_COLORS.axis, fontSize: 12 };

export const AXIS_PROPS = {
  tick: AXIS_TICK,
  axisLine: false,
  tickLine: false,
};

export const TOOLTIP_STYLE = {
  backgroundColor: CHART_COLORS.surface,
  border: `1px solid ${CHART_COLORS.border}`,
  borderRadius: '8px',
  color: CHART_COLORS.foreground,
};

export const TOOLTIP_PROPS = {
  contentStyle: TOOLTIP_STYLE,
  cursor: { fill: 'rgba(39, 39, 42, 0.5)' },
};

export const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 };

export const INCOME_COLOR = CHART_COLORS.success;
export const EXPENSE_COLOR = CHART_COLORS.danger;
export const INCOME_FILL = 'rgba(34, 197, 94, 0.2)';
export const EXPENSE_FILL = 'rgba(239, 68, 68, 0.2)';

export const DEFAULT_CHART_HEIGHT = 300;

export const BAR_RADIUS = [4, 4, 0, 0];

export const PIE_INNER_RADIUS = 60;
export const PIE_OUTER_RADIUS = 100;

export const CHART_ANIMATION = { duration: 0, easing: 'linear' };
