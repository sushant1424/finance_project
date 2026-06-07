import { z } from 'zod';
import { CATEGORIES } from '@/constants/categories';

const categoryIds = CATEGORIES.map((c) => c.id);

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { message: 'Select a transaction type' }),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(200),
  category: z.enum(categoryIds, { message: 'Select a category' }),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional().nullable(),
});

export const transactionFilterSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  amount_min: z.coerce.number().optional(),
  amount_max: z.coerce.number().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['date', 'amount', 'description']).default('date'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'Select at least one transaction'),
});
