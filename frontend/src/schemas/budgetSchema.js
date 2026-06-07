import { z } from 'zod';
import { CATEGORIES } from '@/constants/categories';

const categoryIds = CATEGORIES.map((c) => c.id);

export const budgetSchema = z.object({
  category: z.enum(categoryIds, { message: 'Select a category' }),
  monthly_limit: z.coerce.number().positive('Budget limit must be greater than 0'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
});

export const budgetUpdateSchema = z.object({
  monthly_limit: z.coerce.number().positive('Budget limit must be greater than 0'),
});

export const budgetFilterSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
});
