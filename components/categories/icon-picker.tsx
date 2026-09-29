"use client";

import { CATEGORY_ICON_COMPONENTS } from "@/components/categories/category-icon";
import { CATEGORY_ICONS, type CategoryIconName } from "@/lib/categories";
import { cn } from "@/lib/utils";

type IconPickerProps = {
  value: string;
  color: string;
  onChange: (icon: CategoryIconName) => void;
  labelId: string;
};

function toLabel(name: string) {
  return name.replace(/-\d+$/, "").replace(/-/g, " ");
}

export function IconPicker({ value, color, onChange, labelId }: IconPickerProps) {
  return (
    <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-6 gap-2 sm:grid-cols-9">
      {CATEGORY_ICONS.map((name) => {
        const Icon = CATEGORY_ICON_COMPONENTS[name];
        const isSelected = value === name;
        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={toLabel(name)}
            title={toLabel(name)}
            onClick={() => onChange(name)}
            className={cn(
              "flex aspect-square w-full items-center justify-center rounded-lg transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
              isSelected
                ? "text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
            )}
            style={isSelected ? { backgroundColor: color } : undefined}
          >
            <Icon className="size-5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
