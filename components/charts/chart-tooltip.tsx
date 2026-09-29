import type { TooltipContentProps, TooltipValueType } from "recharts";

import { formatRupiah } from "@/lib/money";

type ChartTooltipProps = Partial<TooltipContentProps<TooltipValueType, string | number>> & {
  /** Heading for the hovered point; defaults to the axis label. */
  title?: (payload: Record<string, unknown>) => string;
  /** Extra line under each value, e.g. a share or status. */
  detail?: (name: string, payload: Record<string, unknown>) => string | undefined;
};

/** Shared tooltip: one row per series, value first (Rupiah), series name second. */
export function ChartTooltip({ active, payload, label, title, detail }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as Record<string, unknown>;

  return (
    <div className="min-w-40 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {title ? title(point) : String(label ?? "")}
      </p>
      <ul className="flex flex-col gap-1.5">
        {payload.map((item) => {
          const name = String(item.name ?? "");
          const itemPayload = item.payload as { fill?: string; color?: string } | undefined;
          const color = item.color ?? itemPayload?.fill ?? itemPayload?.color;
          const extra = detail?.(name, point);
          return (
            <li key={name}>
              <p className="text-sm font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
                {formatRupiah(Number(item.value ?? 0))}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span
                  aria-hidden
                  className="inline-block h-0.5 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {name}
                {extra ? <span className="text-zinc-400">· {extra}</span> : null}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
