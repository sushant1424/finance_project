import { z } from "zod";

export const transactionSchema = z
  .object({
    type: z.enum(["income", "expense", "transfer"], { message: "Select a transaction type" }),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    description: z.string().min(1, "Description is required").max(100),
    category: z.string().min(1, "Select a category"),
    date: z.string().min(1, "Date is required"),
    notes: z.string().max(500).optional().nullable(),
    is_recurring: z.boolean().optional().default(false),
    frequency: z.enum(["weekly", "bi-weekly", "monthly", "quarterly", "yearly"]).optional(),
    account_id: z.string().optional().nullable(),
    to_account_id: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "transfer") {
      if (!data.account_id) {
        ctx.addIssue({ code: "custom", message: "Select a from account", path: ["account_id"] });
      }
      if (!data.to_account_id) {
        ctx.addIssue({ code: "custom", message: "Select a to account", path: ["to_account_id"] });
      }
      if (data.account_id && data.to_account_id && data.account_id === data.to_account_id) {
        ctx.addIssue({
          code: "custom",
          message: "From and to accounts must be different",
          path: ["to_account_id"],
        });
      }
    }
  });

export const transactionFilterSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]).optional(),
  category: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  amount_min: z.coerce.number().optional(),
  amount_max: z.coerce.number().optional(),
  search: z.string().optional(),
  sort_by: z.enum(["date", "amount", "description"]).default("date"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "Select at least one transaction"),
});
