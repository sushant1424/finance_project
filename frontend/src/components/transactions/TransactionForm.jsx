import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/categories";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategorySuggestion } from "@/hooks/useCategorySuggestion";
import { useAnomalyCheck } from "@/hooks/useAnomalyCheck";
import { transactionSchema } from "@/schemas/transactionSchema";
import { FREQUENCIES } from "@/constants/recurring";
import { toISODateString } from "@/utils/formatDate";
import { categorySlug } from "@/utils/resolveCategory";

export default function TransactionForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  /** When true, account select is fixed to defaultValues.account_id (account detail page). */
  lockAccount = false,
}) {
  const { custom } = useCategories();
  const { accounts } = useAccounts();
  const lockedAccountId = lockAccount ? defaultValues?.account_id : undefined;
  const defaultAccountId =
    lockedAccountId
    ?? defaultValues?.account_id
    ?? accounts.find((a) => a.is_default)?.id
    ?? accounts[0]?.id
    ?? undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      description: "",
      category: "food",
      date: toISODateString(new Date()),
      notes: "",
      is_recurring: false,
      frequency: "monthly",
      account_id: defaultAccountId,
      to_account_id: undefined,
      ...defaultValues,
    },
  });

  const type = watch("type");
  const accountId = watch("account_id");
  const category = watch("category");
  const amount = watch("amount");
  const toAccountId = watch("to_account_id");
  const descriptionValue = watch("description");
  const suggestion = useCategorySuggestion(descriptionValue, type === "transfer" ? "expense" : type);
  const anomaly = useAnomalyCheck(amount, category, type);

  // Prefer default account once list loads (unless this form is locked to an account)
  useEffect(() => {
    if (lockedAccountId) {
      setValue("account_id", lockedAccountId);
      return;
    }
    if (accountId || !accounts.length) return;
    const preferred = accounts.find((a) => a.is_default) ?? accounts[0];
    if (preferred) setValue("account_id", preferred.id);
  }, [accounts, accountId, lockedAccountId, setValue]);

  useEffect(() => {
    if (type === "transfer") {
      setValue("category", "transfer");
      setValue("is_recurring", false);
    } else if (category === "transfer") {
      setValue("category", type === "income" ? "salary" : "food");
    }
  }, [type, category, setValue]);

  useEffect(() => {
    if (type !== "transfer" || accounts.length < 2) return;
    const fromId = accountId ?? accounts[0]?.id;
    if (!toAccountId || toAccountId === fromId) {
      const other = accounts.find((a) => a.id !== fromId);
      if (other) setValue("to_account_id", other.id);
    }
  }, [type, accounts, accountId, toAccountId, setValue]);

  const baseCategories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const customForType = custom.map((c) => ({
    id: categorySlug(c.name),
    label: c.name,
    icon: c.icon || "📁",
    color: c.color || "#71717a",
  }));
  const allCategories = [...baseCategories, ...customForType];

  const handleFormSubmit = (data) => {
    const payload = { ...data };
    if (payload.type === "transfer") {
      payload.category = "transfer";
      payload.is_recurring = false;
    } else {
      payload.to_account_id = null;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setValue("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-danger">{errors.type.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" step="0.01" {...register("amount")} />
          {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
          {anomaly && (
            <p
              className={
                anomaly.severity === "high"
                  ? "mt-1 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-xs text-foreground"
                  : "mt-1 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-muted"
              }
              role="status"
            >
              <span className="mr-1" aria-hidden>⚠️</span>
              {anomaly.reason || "This looks unusual for this category. Is that right?"}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} placeholder={type === "transfer" ? "e.g. ATM withdrawal" : undefined} />
        {suggestion && type !== "transfer" && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted">Suggested:</span>
            <button
              type="button"
              onClick={() => setValue("category", suggestion)}
              className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors capitalize"
            >
              {suggestion.replace(/_/g, " ")} - tap to use
            </button>
          </div>
        )}
        {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
      </div>

      {type === "transfer" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>From</Label>
            <Select
              value={watch("account_id") ?? ""}
              onValueChange={(v) => setValue("account_id", v)}
            >
              <SelectTrigger><SelectValue placeholder="From account" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account_id && <p className="text-xs text-danger">{errors.account_id.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Select
              value={watch("to_account_id") ?? ""}
              onValueChange={(v) => setValue("to_account_id", v)}
            >
              <SelectTrigger><SelectValue placeholder="To account" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.to_account_id && <p className="text-xs text-danger">{errors.to_account_id.message}</p>}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {allCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-danger">{errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Account</Label>
            <Select
              value={watch("account_id") ?? defaultAccountId ?? ""}
              onValueChange={(v) => setValue("account_id", v)}
              disabled={Boolean(lockedAccountId)}
            >
              <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}{a.is_default ? ' (default)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" {...register("date")} />
        {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" {...register("notes")} />
      </div>

      {type !== "transfer" && (
        <>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={watch("is_recurring")}
              onCheckedChange={(v) => setValue("is_recurring", Boolean(v))}
            />
            <span className="text-sm text-foreground">Recurring {type === "income" ? "income" : "bill"}</span>
          </label>

          {watch("is_recurring") && (
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={watch("frequency") ?? "monthly"}
                onValueChange={(v) => setValue("frequency", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
