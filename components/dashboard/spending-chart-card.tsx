import { ChartColumn } from "lucide-react";

import { SpendingChart, type SpendingPoint } from "@/components/dashboard/spending-chart";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getMonthlySpending } from "@/lib/data/dashboard";
import { formatMonth } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

export async function SpendingChartCard({ userId, today }: { userId: string; today: string }) {
  const months = await getMonthlySpending(userId, today);
  const data: SpendingPoint[] = months.map((point) => ({
    ...point,
    label: formatMonth(point.month),
    fullLabel: formatMonth(point.month, { month: "long", year: "numeric" }),
  }));
  const hasSpending = data.some((point) => point.total > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Monthly spending</CardTitle>
        <CardDescription>Expenses over the last 6 months</CardDescription>
      </CardHeader>

      {hasSpending ? (
        <>
          <SpendingChart data={data} />
          {/* Table view: every value is reachable without hovering. */}
          <details className="group mt-3 text-sm">
            <summary className="cursor-pointer text-zinc-500 select-none hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
              Show as table
            </summary>
            <table className="mt-2 w-full">
              <thead className="sr-only">
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Spending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.map((point) => (
                  <tr key={point.month}>
                    <th scope="row" className="py-1.5 text-left font-normal text-zinc-600 dark:text-zinc-400">
                      {point.fullLabel}
                      {point.isCurrent ? " (so far)" : ""}
                    </th>
                    <td className="py-1.5 text-right font-medium text-zinc-900 tabular-nums dark:text-zinc-100">
                      {formatRupiah(point.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      ) : (
        <EmptyState
          icon={ChartColumn}
          title="No spending yet"
          description="Expenses from the last 6 months will show up here."
          className="border-none py-10"
        />
      )}
    </Card>
  );
}
