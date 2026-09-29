"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatRupiahCompact } from "@/lib/money";

export type TrendPoint = { key: string; label: string; fullLabel: string; total: number };

const tick = { fill: "var(--chart-muted)", fontSize: 12 };

/** Single series (spending): one color, no legend; the card title names it. */
export function SpendingTrend({ points, daily }: { points: TrendPoint[]; daily: boolean }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="label"
            tick={tick}
            tickLine={false}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tickMargin={8}
            minTickGap={16}
          />
          <YAxis tick={tick} tickFormatter={formatRupiahCompact} tickLine={false} axisLine={false} width={72} />
          <Tooltip
            content={<ChartTooltip title={(point) => String(point.fullLabel)} />}
            // Crosshair: the pointer finds the date, not the 2px line.
            cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="total"
            name="Spending"
            stroke="var(--series-2)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            // Daily series are dense; show markers only on hover.
            dot={daily ? false : { r: 4, fill: "var(--series-2)", stroke: "var(--chart-surface)", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "var(--series-2)", stroke: "var(--chart-surface)", strokeWidth: 2 }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
