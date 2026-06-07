export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'UtensilsCrossed', color: '#f59e0b' },
  { id: 'transport', label: 'Transport', icon: 'Car', color: '#3b82f6' },
  { id: 'housing', label: 'Housing', icon: 'Home', color: '#8b5cf6' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Tv', color: '#ec4899' },
  { id: 'health', label: 'Health', icon: 'Heart', color: '#ef4444' },
  { id: 'education', label: 'Education', icon: 'GraduationCap', color: '#06b6d4' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: '#f97316' },
  { id: 'utilities', label: 'Utilities', icon: 'Zap', color: '#eab308' },
  { id: 'travel', label: 'Travel', icon: 'Plane', color: '#10b981' },
  { id: 'personal', label: 'Personal Care', icon: 'Smile', color: '#a855f7' },
  { id: 'investment', label: 'Investment', icon: 'TrendingUp', color: '#22c55e' },
  { id: 'salary', label: 'Salary', icon: 'Briefcase', color: '#22c55e' },
  { id: 'freelance', label: 'Freelance', icon: 'Laptop', color: '#06b6d4' },
  { id: 'business', label: 'Business', icon: 'Building2', color: '#8b5cf6' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal', color: '#71717a' },
];

export const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id);

export const EXPENSE_CATEGORIES = CATEGORIES.filter(
  (c) => !['salary', 'freelance', 'business', 'investment'].includes(c.id),
);

export const INCOME_CATEGORIES = CATEGORIES.filter((c) =>
  ['salary', 'freelance', 'business', 'investment', 'other'].includes(c.id),
);
