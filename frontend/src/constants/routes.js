export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  NOTIFICATIONS: '/notifications',
  TRANSACTIONS: '/transactions',
  BUDGETS: '/budgets',
  GOALS: '/goals',
  REPORTS: '/reports',
  INSIGHTS: '/insights',
  ANOMALIES: '/anomalies',
  NET_WORTH: '/networth',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

export const PUBLIC_ROUTES = [ROUTES.LANDING, ROUTES.LOGIN, ROUTES.REGISTER];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.NOTIFICATIONS,
  ROUTES.TRANSACTIONS,
  ROUTES.BUDGETS,
  ROUTES.GOALS,
  ROUTES.REPORTS,
  ROUTES.ANOMALIES,
  ROUTES.NET_WORTH,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
];

export const NAV_ITEMS = {
  overview: [
    { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: 'Bell', showBadge: true },
    { path: ROUTES.NET_WORTH, label: 'Net Worth', icon: 'TrendingUp' },
  ],
  money: [
    { path: ROUTES.TRANSACTIONS, label: 'Transactions', icon: 'ArrowLeftRight' },
    { path: ROUTES.BUDGETS, label: 'Budgets', icon: 'PiggyBank' },
    { path: ROUTES.GOALS, label: 'Goals', icon: 'Target' },
  ],
  insights: [
    { path: ROUTES.INSIGHTS, label: 'Insights', icon: 'Lightbulb' },
    { path: ROUTES.REPORTS, label: 'Reports', icon: 'BarChart3' },
    { path: ROUTES.ANOMALIES, label: 'Anomalies', icon: 'AlertTriangle' },
  ],
  account: [
    { path: ROUTES.PROFILE, label: 'Profile', icon: 'User' },
    { path: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
  ],
};
