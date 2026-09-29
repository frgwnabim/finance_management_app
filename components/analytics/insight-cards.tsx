import { CalendarDays, PiggyBank } from "lucide-react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { Card } from "@/components/ui/card";
import type { Analytics } from "@/lib/data/analytics";
import { formatRupiah } from "@/lib/money";
import { cn, pluralize } from "@/lib/utils";

function formatShare(value: number) {
  return `${(value * 100).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

export function InsightCards({
  insights,
  totals,
}: Pick<Analytics, "insights" | "totals">) {
  const { biggestCategory, averageDaily, daysElapsed, savingsRate } = insights;

  return (
    <section aria-label="Insights" className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Insight
        label="Biggest spending category"
        icon={
          biggestCategory ? (
            <CategoryIcon icon={biggestCategory.icon} color={biggestCategory.color} size="sm" />
          ) : null
        }
        value={biggestCategory?.name ?? "No spending yet"}
        detail={
          biggestCategory
            ? `${formatRupiah(biggestCategory.total)}, ${formatShare(biggestCategory.share)} of spending`
            : "Add expenses to see where your money goes."
        }
      />
      <Insight
        label="Average daily spending"
        icon={<IconBadge><CalendarDays className="size-4" aria-hidden /></IconBadge>}
        value={formatRupiah(averageDaily)}
        detail={`${formatRupiah(totals.expense)} over ${pluralize(daysElapsed, "day")}`}
      />
      <Insight
        label="Savings rate"
        icon={<IconBadge><PiggyBank className="size-4" aria-hidden /></IconBadge>}
        value={savingsRate === null ? "No income yet" : formatShare(savingsRate)}
        valueClassName={savingsRate !== null && savingsRate < 0 ? "text-red-600 dark:text-red-400" : undefined}
        detail={
          savingsRate === null
            ? "Record income to see how much you save."
            : totals.net >= 0
              ? `Saved ${formatRupiah(totals.net)} of ${formatRupiah(totals.income)} income`
              : `Spent ${formatRupiah(-totals.net)} more than you earned`
        }
        className="sm:col-span-2 lg:col-span-1"
      />
    </section>
  );
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      {children}
    </span>
  );
}

function Insight({
  label,
  icon,
  value,
  valueClassName,
  detail,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  valueClassName?: string;
  detail: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        {icon}
      </div>
      <p
        className={cn(
          "mt-3 truncate text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50",
          valueClassName,
        )}
        title={value}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{detail}</p>
    </Card>
  );
}
