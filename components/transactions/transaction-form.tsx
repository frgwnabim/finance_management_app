"use client";

import { useId, useState, useTransition } from "react";

import { CategoryPicker } from "@/components/transactions/category-picker";
import { TRANSACTION_TYPE_OPTIONS } from "@/components/transactions/type-options";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { toast } from "@/components/ui/toast";
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import type { CategoryOption } from "@/lib/data/categories";
import type { TransactionType } from "@/lib/generated/prisma/client";
import type { TransactionField } from "@/lib/validations/transaction";

export type TransactionFormValues = {
  id?: string;
  type: TransactionType;
  amount: number | null;
  categoryId: string;
  date: string;
  note: string;
};

type TransactionFormProps = {
  categories: CategoryOption[];
  initialValues: TransactionFormValues;
  onDone: () => void;
  onCancel: () => void;
};

type FieldErrors = Partial<Record<TransactionField, string[]>>;

export function TransactionForm({
  categories,
  initialValues,
  onDone,
  onCancel,
}: TransactionFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();
  const typeLabelId = useId();
  const amountId = useId();
  const categoryLabelId = useId();

  const categoriesOfType = categories.filter((category) => category.type === values.type);

  function update<K extends keyof TransactionFormValues>(
    key: K,
    value: TransactionFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function changeType(type: TransactionType) {
    // Keep the category only if it fits the new type; otherwise pick the first one.
    const current = categories.find((category) => category.id === values.categoryId);
    const categoryId =
      current?.type === type
        ? current.id
        : (categories.find((category) => category.type === type)?.id ?? "");
    setValues((prev) => ({ ...prev, type, categoryId }));
    setErrors({});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const input = {
        type: values.type,
        amount: values.amount,
        categoryId: values.categoryId,
        date: values.date,
        note: values.note,
      };
      const result = values.id
        ? await updateTransaction({ ...input, id: values.id })
        : await createTransaction(input);

      if (result.ok) {
        toast.success(result.message);
        onDone();
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message);
      }
    });
  }

  const amountError = errors.amount?.[0];
  const categoryError = errors.categoryId?.[0];

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label id={typeLabelId} as="span">
          Type
        </Label>
        <SegmentedControl
          options={TRANSACTION_TYPE_OPTIONS}
          value={values.type}
          onChange={changeType}
          aria-labelledby={typeLabelId}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={amountId}>Amount</Label>
        <CurrencyInput
          id={amountId}
          value={values.amount}
          onValueChange={(amount) => update("amount", amount)}
          placeholder="0"
          data-autofocus
          aria-invalid={amountError ? true : undefined}
          aria-describedby={amountError ? `${amountId}-error` : undefined}
        />
        {amountError ? <FieldError id={`${amountId}-error`} message={amountError} /> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label id={categoryLabelId} as="span">
          Category
        </Label>
        <CategoryPicker
          categories={categoriesOfType}
          value={values.categoryId}
          onChange={(categoryId) => update("categoryId", categoryId)}
          labelId={categoryLabelId}
          invalid={Boolean(categoryError)}
        />
        {categoryError ? <FieldError message={categoryError} /> : null}
      </div>

      <FormField
        id="transaction-date"
        type="date"
        label="Date"
        value={values.date}
        onChange={(event) => update("date", event.target.value)}
        required
        errors={errors.date}
      />

      <FormField
        id="transaction-note"
        label="Note (optional)"
        value={values.note}
        onChange={(event) => update("note", event.target.value)}
        maxLength={200}
        autoComplete="off"
        placeholder="e.g. Lunch with team"
        errors={errors.note}
      />

      <DialogFooter className="sticky -bottom-4 -mx-4 -mb-4 border-t border-zinc-200 bg-white px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {values.id ? "Save changes" : "Add transaction"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FieldError({ id, message }: { id?: string; message: string }) {
  return (
    <p id={id} className="text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}
