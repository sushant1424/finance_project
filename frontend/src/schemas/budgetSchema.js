import { z } from "zod";

export const budgetSchema = z.object({
  category: z.string().min(1, "Select a category"),
  monthly_limit: z.coerce
    .number()
    .positive("Budget limit must be greater than 0"),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
  rollover: z.boolean().optional().default(false),
});

export const budgetUpdateSchema = z.object({
  monthly_limit: z.coerce
    .number()
    .positive("Budget limit must be greater than 0"),
  rollover: z.boolean().optional(),
});

export const budgetFilterSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
});
