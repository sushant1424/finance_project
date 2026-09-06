import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100),
  target_amount: z.coerce.number().positive('Target must be greater than 0'),
  current_amount: z.coerce.number().min(0, 'Current amount cannot be negative').default(0),
  target_date: z.string().min(1, 'Target date is required'),
  icon: z.string().default('🎯'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').default('#06b6d4'),
});

export const goalUpdateSchema = goalSchema.partial();

export const contributionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  note: z.string().max(200).optional().nullable(),
  date: z.string().min(1, 'Date is required'),
});

export const GOAL_COLORS = ['#06b6d4', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

export const GOAL_ICONS = ['🎯', '💰', '🏠', '💻', '✈️', '🚗', '🎓', '💍', '🏥', '🎮'];
