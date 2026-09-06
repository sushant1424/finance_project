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
import { EXPENSE_CATEGORIES } from "@/constants/categories";
import { useCategories } from "@/hooks/useCategories";
import { budgetSchema } from "@/schemas/budgetSchema";

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2000, i, 1).toLocaleString("en", { month: "long" }),
}));

export default function BudgetForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const { custom } = useCategories();
  const now = new Date();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "food",
      monthly_limit: "",
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      rollover: false,
      ...defaultValues,
    },
  });

  const customCategories = custom.map((c) => ({
    id: c.name.toLowerCase().replace(/\s+/g, "_"),
    label: c.name,
  }));
  const allCategories = [...EXPENSE_CATEGORIES, ...customCategories];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={watch("category")}
          onValueChange={(v) => setValue("category", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-danger">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthly_limit">Monthly limit</Label>
        <Input
          id="monthly_limit"
          type="number"
          step="0.01"
          {...register("monthly_limit")}
        />
        {errors.monthly_limit && (
          <p className="text-xs text-danger">{errors.monthly_limit.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Month</Label>
          <Select
            value={String(watch("month"))}
            onValueChange={(v) => setValue("month", Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" type="number" {...register("year")} />
          {errors.year && (
            <p className="text-xs text-danger">{errors.year.message}</p>
          )}
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3">
        <Checkbox
          checked={Boolean(watch("rollover"))}
          onCheckedChange={(v) => setValue("rollover", Boolean(v))}
          className="mt-0.5"
        />
        <span>
          <span className="block text-sm font-medium">Rollover unused budget</span>
          <span className="text-xs text-muted">
            Carry unspent amount into next month instead of resetting to zero.
          </span>
        </span>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
