"use client";

import { useId, useState, useTransition } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { deleteBudget, setBudget } from "@/lib/actions/budgets";
import type { BudgetRow } from "@/lib/data/budgets";
import { formatMonth } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

type BudgetFormProps = {
  row: BudgetRow;
  month: string;
  onDone: () => void;
  onCancel: () => void;
};

export function BudgetForm({ row, month, onDone, onCancel }: BudgetFormProps) {
  const [amount, setAmount] = useState<number | null>(row.budget?.amount ?? null);
  const [error, setError] = useState<string | undefined>();
  const [isSaving, startSave] = useTransition();
  const [isRemoving, startRemove] = useTransition();
  const amountId = useId();
  const monthName = formatMonth(month, { month: "long" });
  const isBusy = isSaving || isRemoving;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startSave(async () => {
      const result = await setBudget({ categoryId: row.category.id, month, amount });
      if (result.ok) {
        toast.success(result.message);
        onDone();
      } else {
        setError(result.fieldErrors?.amount?.[0]);
        toast.error(result.message);
      }
    });
  }

  function handleRemove() {
    startRemove(async () => {
      const result = await deleteBudget({ categoryId: row.category.id, month });
      if (result.ok) {
        toast.success(result.message);
        onDone();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
        <CategoryIcon icon={row.category.icon} color={row.category.color} />
        <div className="min-w-0">
          <p className="truncate font-medium">{row.category.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Spent {formatRupiah(row.spent)} in {monthName} so far
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={amountId}>Monthly limit for {monthName}</Label>
        <CurrencyInput
          id={amountId}
          value={amount}
          onValueChange={(value) => {
            setAmount(value);
            setError(undefined);
          }}
          placeholder="0"
          data-autofocus
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${amountId}-error` : undefined}
        />
        {error ? (
          <p id={`${amountId}-error`} className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
      </div>

      <DialogFooter className="pt-1">
        {row.budget ? (
          <Button
            variant="ghost"
            onClick={handleRemove}
            isLoading={isRemoving}
            disabled={isBusy}
            className="text-red-600 hover:bg-red-50 sm:mr-auto dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Remove budget
          </Button>
        ) : null}
        <Button variant="secondary" onClick={onCancel} disabled={isBusy}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving} disabled={isBusy}>
          {row.budget ? "Save changes" : "Set budget"}
        </Button>
      </DialogFooter>
    </form>
  );
}
