"use client";

import { useId, useState, useTransition } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { ColorPicker } from "@/components/categories/color-picker";
import { IconPicker } from "@/components/categories/icon-picker";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { TRANSACTION_TYPE_LABELS } from "@/lib/categories";
import type { TransactionType } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

export type CategoryFormValues = {
  id?: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
};

type FieldErrors = Partial<Record<"name" | "type" | "color" | "icon", string[]>>;

type CategoryFormProps = {
  initialValues: CategoryFormValues;
  onDone: () => void;
  onCancel: () => void;
};

const TYPES: TransactionType[] = ["EXPENSE", "INCOME"];

export function CategoryForm({ initialValues, onDone, onCancel }: CategoryFormProps) {
  const isEdit = Boolean(initialValues.id);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();
  const typeLabelId = useId();
  const colorLabelId = useId();
  const iconLabelId = useId();

  function update<K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const { id, name, type, color, icon } = values;
      const result = id
        ? await updateCategory({ id, name, color, icon })
        : await createCategory({ name, type, color, icon });

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
      <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
        <CategoryIcon icon={values.icon} color={values.color} />
        <div className="min-w-0">
          <p className="truncate font-medium">{values.name.trim() || "Category name"}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {TRANSACTION_TYPE_LABELS[values.type]}
          </p>
        </div>
      </div>

      <FormField
        id="category-name"
        label="Name"
        value={values.name}
        onChange={(event) => update("name", event.target.value)}
        maxLength={40}
        autoComplete="off"
        required
        errors={errors.name}
      />

      {isEdit ? null : (
        <div className="flex flex-col gap-1.5">
          <Label id={typeLabelId} as="span">Type</Label>
          <div role="radiogroup" aria-labelledby={typeLabelId} className="grid grid-cols-2 gap-2">
            {TYPES.map((type) => {
              const isSelected = values.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => update("type", type)}
                  className={cn(
                    "h-10 rounded-lg border text-sm font-medium transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
                    isSelected
                      ? type === "INCOME"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                      : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
                  )}
                >
                  {TRANSACTION_TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label id={colorLabelId} as="span">Color</Label>
        <ColorPicker
          value={values.color}
          onChange={(color) => update("color", color)}
          labelId={colorLabelId}
        />
        {errors.color ? <FieldError message={errors.color[0]} /> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label id={iconLabelId} as="span">Icon</Label>
        <IconPicker
          value={values.icon}
          color={values.color}
          onChange={(icon) => update("icon", icon)}
          labelId={iconLabelId}
        />
        {errors.icon ? <FieldError message={errors.icon[0]} /> : null}
      </div>

      {/* Sticky so the actions stay reachable when the pickers overflow on small screens. */}
      <DialogFooter className="sticky -bottom-4 -mx-4 -mb-4 border-t border-zinc-200 bg-white px-4 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEdit ? "Save changes" : "Create category"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  return <p className="text-sm text-red-600 dark:text-red-400">{message}</p>;
}
