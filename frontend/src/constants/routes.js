export const ROUTES = {
  LANDING: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
  TRANSACTIONS: "/transactions",
  BUDGETS: "/budgets",
  GOALS: "/goals",
  BILLS: "/bills",
  STATISTICS: "/statistics",
  STATISTICS_OVERVIEW: "/statistics/overview",
  STATISTICS_SPENDING: "/statistics/spending",
  STATISTICS_SAVINGS: "/statistics/savings",
  SETTINGS: "/settings",
  ACCOUNTS: "/accounts",
  ACCOUNT_DETAIL: "/accounts/:accountId",
  CATEGORIES: "/categories",
  NOTIFICATIONS: "/notifications",
  // Legacy paths kept for redirects in App.jsx
  REPORTS: "/reports",
  INSIGHTS: "/insights",
  ANOMALIES: "/anomalies",
  NET_WORTH: "/networth",
  RECURRING: "/recurring",
  PROFILE: "/profile",
};

export const PUBLIC_ROUTES = [
  ROUTES.LANDING,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.TRANSACTIONS,
  ROUTES.BUDGETS,
  ROUTES.GOALS,
  ROUTES.BILLS,
  ROUTES.STATISTICS,
  ROUTES.STATISTICS_OVERVIEW,
  ROUTES.STATISTICS_SPENDING,
  ROUTES.STATISTICS_SAVINGS,
  ROUTES.ACCOUNTS,
  ROUTES.CATEGORIES,
  ROUTES.NOTIFICATIONS,
  ROUTES.SETTINGS,
];

export const NAV_ITEMS = {
  overview: [
    { path: ROUTES.DASHBOARD, label: "Dashboard", icon: "LayoutDashboard" },
    { path: ROUTES.NOTIFICATIONS, label: "Notifications", icon: "Bell" },
  ],
  money: [
    { path: ROUTES.TRANSACTIONS, label: "Transactions", icon: "ArrowLeftRight" },
    { path: ROUTES.BUDGETS, label: "Budgets", icon: "PiggyBank" },
    { path: ROUTES.GOALS, label: "Goals", icon: "Target" },
    { path: ROUTES.ACCOUNTS, label: "Accounts", icon: "Wallet" },
    { path: ROUTES.CATEGORIES, label: "Categories", icon: "Tag" },
  ],
  account: [
    { path: ROUTES.SETTINGS, label: "Settings", icon: "Settings" },
  ],
};

export const STATISTICS_ITEMS = [
  { path: ROUTES.STATISTICS_OVERVIEW, label: "Overview", icon: "BarChart3" },
  { path: ROUTES.STATISTICS_SPENDING, label: "Spending", icon: "PieChart" },
  { path: ROUTES.STATISTICS_SAVINGS, label: "Savings", icon: "TrendingUp" },
];
