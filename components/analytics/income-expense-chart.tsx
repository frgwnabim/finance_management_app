"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { ToggleLegend, useHiddenSeries, type LegendItem } from "@/components/charts/toggle-legend";
import { formatRupiahCompact } from "@/lib/money";

export type IncomeExpensePoint = {
  month: string;
  label: string;
  fullLabel: string;
  income: number;
  expense: number;
  net: number;
};

const SERIES: LegendItem[] = [
  { key: "income", label: "Income", color: "var(--series-3)", shape: "bar" },
  { key: "expense", label: "Expense", color: "var(--series-2)", shape: "bar" },
  { key: "net", label: "Net savings", color: "var(--series-1)", shape: "line" },
];

const tick = { fill: "var(--chart-muted)", fontSize: 12 };

/** Grouped income/expense bars with a net savings line, all on one Rupiah axis. */
export function IncomeExpenseChart({ points }: { points: IncomeExpensePoint[] }) {
  const { hidden, toggle } = useHiddenSeries();

  return (
    <>
      <ToggleLegend items={SERIES} hidden={hidden} onToggle={toggle} className="mb-3 -ml-2" />
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }} barGap={2} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: "var(--chart-axis)" }} tickMargin={8} />
            <YAxis tick={tick} tickFormatter={formatRupiahCompact} tickLine={false} axisLine={false} width={72} />
            <ReferenceLine y={0} stroke="var(--chart-axis)" />
            <Tooltip
              content={<ChartTooltip title={(point) => String(point.fullLabel)} />}
              cursor={{ fill: "var(--chart-cursor)" }}
              isAnimationActive={false}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="var(--series-3)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              hide={hidden.has("income")}
              animationDuration={500}
            />
            <Bar
              dataKey="expense"
              name="Expense"
              fill="var(--series-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              hide={hidden.has("expense")}
              animationDuration={500}
            />
            <Line
              type="linear"
              dataKey="net"
              name="Net savings"
              stroke="var(--series-1)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--series-1)", stroke: "var(--chart-surface)", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "var(--series-1)", stroke: "var(--chart-surface)", strokeWidth: 2 }}
              hide={hidden.has("net")}
              animationDuration={500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
