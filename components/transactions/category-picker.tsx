"use client";

import Link from "next/link";

import { CategoryIcon } from "@/components/categories/category-icon";
import type { CategoryOption } from "@/lib/data/categories";
import { cn } from "@/lib/utils";

type CategoryPickerProps = {
  categories: CategoryOption[];
  value: string;
  onChange: (categoryId: string) => void;
  labelId: string;
  invalid?: boolean;
};

export function CategoryPicker({
  categories,
  value,
  onChange,
  labelId,
  invalid,
}: CategoryPickerProps) {
  if (categories.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No categories of this type yet.{" "}
        <Link
          href="/app/settings/categories"
          className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          Create one
        </Link>
      </p>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      aria-invalid={invalid || undefined}
      className="flex flex-wrap gap-2"
    >
      {categories.map((category) => {
        const isSelected = category.id === value;
        return (
          <button
            key={category.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(category.id)}
            className={cn(
              "flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
              isSelected
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
            )}
          >
            <CategoryIcon icon={category.icon} color={category.color} size="xs" />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
