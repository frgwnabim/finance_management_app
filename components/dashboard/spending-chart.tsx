"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from "recharts";

import { formatRupiah, formatRupiahCompact } from "@/lib/money";

export type SpendingPoint = {
  month: string;
  /** Short axis label, e.g. "Sept" */
  label: string;
  /** Tooltip label, e.g. "September 2026" */
  fullLabel: string;
  total: number;
  isCurrent: boolean;
};

// Colors come from CSS variables in globals.css, so the chart follows the
// light/dark toggle without re-rendering.
const tick = { fill: "var(--chart-muted)", fontSize: 12 };

/** Single-series column chart: one color, no legend (the card title names it). */
export function SpendingChart({ data }: { data: SpendingPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="label"
            tick={tick}
            tickLine={false}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickMargin={8}
          />
          <YAxis
            tick={tick}
            tickFormatter={formatRupiahCompact}
            tickLine={false}
            axisLine={false}
            width={72}
            allowDecimals={false}
          />
          <Tooltip
            content={SpendingTooltip}
            // The whole month column is the hover target, not just the bar.
            cursor={{ fill: "var(--chart-cursor)" }}
            isAnimationActive={false}
          />
          <Bar
            dataKey="total"
            name="Spending"
            fill="var(--chart-bar)"
            activeBar={{ fill: "var(--chart-bar-active)" }}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            animationDuration={500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SpendingTooltip({ active, payload }: TooltipContentProps<TooltipValueType, string | number>) {
  const point = payload?.[0]?.payload as SpendingPoint | undefined;
  if (!active || !point) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      {/* Value leads; the label is secondary. */}
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {formatRupiah(point.total)}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span
          aria-hidden
          className="inline-block h-0.5 w-3 rounded-full"
          style={{ backgroundColor: "var(--chart-bar)" }}
        />
        {point.fullLabel}
        {point.isCurrent ? " (so far)" : ""}
      </p>
    </div>
  );
}
