import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/stats";
import { cn } from "@/lib/utils";

type StatTileProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Percentage change vs the comparison period, or null when there's no baseline. */
  change: number | null;
  /** Whether an increase is good news (income) or bad news (expenses). */
  upIsGood: boolean;
  comparison: string;
};

export function StatTile({ label, value, icon: Icon, change, upIsGood, comparison }: StatTileProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      {/* Proportional figures for a standalone number (no tabular-nums). */}
      <p className="truncate text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50" title={value}>
        {value}
      </p>
      <Delta change={change} upIsGood={upIsGood} comparison={comparison} />
    </Card>
  );
}

function Delta({
  change,
  upIsGood,
  comparison,
}: Pick<StatTileProps, "change" | "upIsGood" | "comparison">) {
  if (change === null) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">No data for {comparison}</p>
    );
  }

  const rounded = Math.round(change * 10) / 10;
  if (rounded === 0) {
    return (
      <p className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
        <Minus className="size-4" aria-hidden />
        No change vs {comparison}
      </p>
    );
  }

  const isUp = rounded > 0;
  const isGood = isUp === upIsGood;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;

  // Direction is carried by the arrow and the sign, not by color alone.
  return (
    <p className="flex flex-wrap items-center gap-x-1 text-sm">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-medium",
          isGood ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
        )}
      >
        <Arrow className="size-4" aria-hidden />
        <span className="sr-only">{isUp ? "Up" : "Down"}</span>
        {formatPercent(rounded)}
      </span>
      <span className="text-zinc-500 dark:text-zinc-400">vs {comparison}</span>
    </p>
  );
}
