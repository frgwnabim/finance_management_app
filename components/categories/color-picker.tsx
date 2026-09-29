"use client";

import { Check } from "lucide-react";

import { CATEGORY_COLORS, CATEGORY_COLOR_VALUES, type CategoryColor } from "@/lib/categories";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  value: string;
  onChange: (color: CategoryColor) => void;
  labelId: string;
};

export function ColorPicker({ value, onChange, labelId }: ColorPickerProps) {
  return (
    <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-9 gap-2">
      {CATEGORY_COLOR_VALUES.map((color) => {
        const isSelected = value === color;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={CATEGORY_COLORS[color]}
            title={CATEGORY_COLORS[color]}
            onClick={() => onChange(color)}
            className={cn(
              "flex aspect-square w-full items-center justify-center rounded-full text-white transition-transform",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
              isSelected
                ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-zinc-100 dark:ring-offset-zinc-900"
                : "hover:scale-110",
            )}
            style={{ backgroundColor: color }}
          >
            {isSelected ? <Check className="size-4" aria-hidden /> : null}
          </button>
        );
      })}
    </div>
  );
}
