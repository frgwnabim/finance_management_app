"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getBudgetStatusText } from "@/components/budgets/budget-progress";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { ToggleLegend, useHiddenSeries, type LegendItem } from "@/components/charts/toggle-legend";
import { formatRupiahCompact } from "@/lib/money";

export type BudgetPoint = { key: string; name: string; budget: number; actual: number };

const SERIES: LegendItem[] = [
  { key: "budget", label: "Budget", color: "var(--series-1)", shape: "bar" },
  { key: "actual", label: "Actual", color: "var(--series-2)", shape: "bar" },
];

const ROW_HEIGHT = 52;
const tick = { fill: "var(--chart-muted)", fontSize: 12 };

/** Horizontal bars: budget vs actual per category, one row per category. */
export function BudgetChart({ points }: { points: BudgetPoint[] }) {
  const { hidden, toggle } = useHiddenSeries();

  return (
    <>
      <ToggleLegend items={SERIES} hidden={hidden} onToggle={toggle} className="mb-3 -ml-2" />
      <div className="w-full" style={{ height: points.length * ROW_HEIGHT + 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barGap={2} barCategoryGap="24%">
            <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
            <XAxis type="number" tick={tick} tickFormatter={formatRupiahCompact} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={tick}
              tickLine={false}
              axisLine={{ stroke: "var(--chart-axis)" }}
              width={104}
              tickFormatter={(name: string) => (name.length > 13 ? `${name.slice(0, 12)}…` : name)}
            />
            <Tooltip
              content={
                <ChartTooltip
                  title={(point) => String(point.name)}
                  detail={(name, point) =>
                    name === "Actual"
                      ? `${Math.round((Number(point.actual) / Number(point.budget)) * 100)}% used. ${getBudgetStatusText({ spent: Number(point.actual), amount: Number(point.budget) })}`
                      : undefined
                  }
                />
              }
              cursor={{ fill: "var(--chart-cursor)" }}
              isAnimationActive={false}
            />
            <Bar dataKey="budget" name="Budget" fill="var(--series-1)" radius={[0, 4, 4, 0]} maxBarSize={14} hide={hidden.has("budget")} animationDuration={500} />
            <Bar dataKey="actual" name="Actual" fill="var(--series-2)" radius={[0, 4, 4, 0]} maxBarSize={14} hide={hidden.has("actual")} animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
