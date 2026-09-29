"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export type LegendItem = {
  key: string;
  label: string;
  color: string;
  /** Legend swatch mirrors the mark: a block for bars, a stroke for lines. */
  shape: "bar" | "line";
};

/** Which series are hidden, toggled by clicking the legend. */
export function useHiddenSeries() {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const toggle = (key: string) =>
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  return { hidden, toggle };
}

type ToggleLegendProps = {
  items: LegendItem[];
  hidden: ReadonlySet<string>;
  onToggle: (key: string) => void;
  className?: string;
};

/** Legend where each entry is a toggle button that shows or hides its series. */
export function ToggleLegend({ items, hidden, onToggle, className }: ToggleLegendProps) {
  return (
    <ul className={cn("flex flex-wrap gap-x-1 gap-y-1", className)} aria-label="Series">
      {items.map((item) => {
        const isHidden = hidden.has(item.key);
        return (
          <li key={item.key}>
            <button
              type="button"
              aria-pressed={!isHidden}
              onClick={() => onToggle(item.key)}
              title={isHidden ? `Show ${item.label}` : `Hide ${item.label}`}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:hover:bg-zinc-800",
                isHidden
                  ? "text-zinc-400 line-through dark:text-zinc-500"
                  : "text-zinc-700 dark:text-zinc-300",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "inline-block shrink-0",
                  item.shape === "bar" ? "size-3 rounded-sm" : "h-0.5 w-4 rounded-full",
                  isHidden && "opacity-30",
                )}
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
