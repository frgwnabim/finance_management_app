"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { useHiddenSeries } from "@/components/charts/toggle-legend";
import { formatRupiah, formatRupiahCompact } from "@/lib/money";
import { cn } from "@/lib/utils";

export type DonutSlice = {
  key: string;
  name: string;
  color: string;
  total: number;
  /** Transactions page, filtered to this slice's categories and the period. */
  href: string;
};

function formatShare(value: number) {
  return `${(value * 100).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

/**
 * Part-to-whole of spending. Clicking a slice (or its arrow link) opens the
 * matching transactions; clicking a legend name hides or shows the slice.
 * Shares always stay relative to total spending.
 */
export function CategoryDonut({ slices, total }: { slices: DonutSlice[]; total: number }) {
  const router = useRouter();
  const { hidden, toggle } = useHiddenSeries();
  const visible = slices.filter((slice) => !hidden.has(slice.key));

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,13rem)_1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visible}
              dataKey="total"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
              // The 2px surface-colored stroke is the gap between slices.
              stroke="var(--chart-surface)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              animationDuration={500}
              onClick={(_, index) => {
                const slice = visible[index];
                if (slice) router.push(slice.href);
              }}
            >
              {visible.map((slice) => (
                <Cell key={slice.key} fill={slice.color} className="cursor-pointer outline-none" />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip
                  title={(point) => String(point.name)}
                  detail={(_, point) => `${formatShare(Number(point.total) / total)} of spending`}
                />
              }
              isAnimationActive={false}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Total spent</span>
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50" title={formatRupiah(total)}>
            {formatRupiahCompact(total)}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-1" aria-label="Categories">
        {slices.map((slice) => {
          const isHidden = hidden.has(slice.key);
          return (
            <li key={slice.key} className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={!isHidden}
                onClick={() => toggle(slice.key)}
                title={isHidden ? `Show ${slice.name}` : `Hide ${slice.name}`}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:hover:bg-zinc-800",
                  isHidden ? "text-zinc-400 line-through dark:text-zinc-500" : "text-zinc-700 dark:text-zinc-300",
                )}
              >
                <span
                  aria-hidden
                  className={cn("size-3 shrink-0 rounded-sm", isHidden && "opacity-30")}
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate">{slice.name}</span>
                <span className="ml-auto pl-2 font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
                  {formatShare(slice.total / total)}
                </span>
              </button>
              <Link
                href={slice.href}
                aria-label={`View ${slice.name} transactions, ${formatRupiah(slice.total)}`}
                className="flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-1.5 text-sm text-zinc-500 tabular-nums hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                {formatRupiahCompact(slice.total)}
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
