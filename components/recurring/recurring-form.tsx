"use client";

import { useId, useState, useTransition } from "react";

import { CategoryPicker } from "@/components/transactions/category-picker";
import { TRANSACTION_TYPE_OPTIONS } from "@/components/transactions/type-options";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { SegmentedControl, type SegmentedOption } from "@/components/ui/segmented-control";
import { toast } from "@/components/ui/toast";
import { createRecurring, updateRecurring } from "@/lib/actions/recurring";
import type { CategoryOption } from "@/lib/data/categories";
import { formatDateOnly, todayLocal } from "@/lib/dates";
import type { TransactionType } from "@/lib/generated/prisma/client";
import {
  addDays,
  describeSchedule,
  FREQUENCY_LABELS,
  getDueDates,
  getNextOccurrence,
  type Frequency,
} from "@/lib/recurring-schedule";
import { pluralize } from "@/lib/utils";
import type { RecurringField } from "@/lib/validations/recurring";

export type RecurringFormValues = {
  id?: string;
  type: TransactionType;
  amount: number | null;
  categoryId: string;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  note: string;
};

const FREQUENCY_OPTIONS: SegmentedOption<Frequency>[] = (
  Object.keys(FREQUENCY_LABELS) as Frequency[]
).map((value) => ({ value, label: FREQUENCY_LABELS[value] }));

type FieldErrors = Partial<Record<RecurringField, string[]>>;

export function RecurringForm({
  categories,
  initialValues,
  onDone,
  onCancel,
}: {
  categories: CategoryOption[];
  initialValues: RecurringFormValues;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();
  const ids = { type: useId(), amount: useId(), category: useId(), frequency: useId() };
  const isEdit = Boolean(values.id);

  function update<K extends keyof RecurringFormValues>(key: K, value: RecurringFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function changeType(type: TransactionType) {
    const current = categories.find((category) => category.id === values.categoryId);
    const categoryId =
      current?.type === type ? current.id : (categories.find((c) => c.type === type)?.id ?? "");
    setValues((prev) => ({ ...prev, type, categoryId }));
    setErrors({});
  }

  // Live preview of the schedule, computed in the browser.
  const today = todayLocal();
  const schedule = {
    frequency: values.frequency,
    startDate: values.startDate,
    endDate: values.endDate || null,
  };
  const hasValidDates = /^\d{4}-\d{2}-\d{2}$/.test(values.startDate);
  const nextDate = hasValidDates ? getNextOccurrence(schedule, addDays(today, -1)) : null;
  const backfill = hasValidDates && !isEdit ? getDueDates(schedule, null, today).length : 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const input = {
        type: values.type,
        amount: values.amount,
        categoryId: values.categoryId,
        frequency: values.frequency,
        startDate: values.startDate,
        endDate: values.endDate || null,
        note: values.note,
      };
      const result = values.id
        ? await updateRecurring({ ...input, id: values.id })
        : await createRecurring(input);
      if (result.ok) {
        toast.success(result.message);
        onDone();
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label id={ids.type} as="span">Type</Label>
        <SegmentedControl options={TRANSACTION_TYPE_OPTIONS} value={values.type} onChange={changeType} aria-labelledby={ids.type} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={ids.amount}>Amount</Label>
        <CurrencyInput
          id={ids.amount}
          value={values.amount}
          onValueChange={(amount) => update("amount", amount)}
          placeholder="0"
          data-autofocus
          aria-invalid={errors.amount ? true : undefined}
        />
        <FieldError message={errors.amount?.[0]} />
      </div>

      <div className="flex flex-col gap-2">
        <Label id={ids.category} as="span">Category</Label>
        <CategoryPicker
          categories={categories.filter((category) => category.type === values.type)}
          value={values.categoryId}
          onChange={(categoryId) => update("categoryId", categoryId)}
          labelId={ids.category}
          invalid={Boolean(errors.categoryId)}
        />
        <FieldError message={errors.categoryId?.[0]} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label id={ids.frequency} as="span">Repeats</Label>
        <SegmentedControl
          options={FREQUENCY_OPTIONS}
          value={values.frequency}
          onChange={(frequency) => update("frequency", frequency)}
          aria-labelledby={ids.frequency}
          className="text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="recurring-start"
          type="date"
          label="Start date"
          value={values.startDate}
          onChange={(event) => update("startDate", event.target.value)}
          required
          errors={errors.startDate}
        />
        <FormField
          id="recurring-end"
          type="date"
          label="End date (optional)"
          value={values.endDate}
          min={values.startDate || undefined}
          onChange={(event) => update("endDate", event.target.value)}
          errors={errors.endDate}
        />
      </div>

      <FormField
        id="recurring-note"
        label="Note (optional)"
        value={values.note}
        onChange={(event) => update("note", event.target.value)}
        maxLength={200}
        autoComplete="off"
        placeholder="e.g. Netflix, Salary, Rent"
        errors={errors.note}
      />

      {hasValidDates ? (
        <div className="rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-950">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {describeSchedule(values.frequency, values.startDate)}
          </p>
          <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">
            {nextDate ? `Next on ${formatDateOnly(nextDate)}` : "No more occurrences after the end date"}
            {backfill > 0 ? `. ${pluralize(backfill, "past occurrence")} since the start date will be added now.` : ""}
          </p>
          {isEdit ? (
            <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">
              Changes apply to future transactions only.
            </p>
          ) : null}
        </div>
      ) : null}

      <DialogFooter className="sticky -bottom-4 -mx-4 -mb-4 border-t border-zinc-200 bg-white px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEdit ? "Save changes" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-600 dark:text-red-400">{message}</p> : null;
}
