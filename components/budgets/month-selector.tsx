import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { formatMonth, shiftMonth } from "@/lib/dates";

type MonthSelectorProps = {
  month: string;
  currentMonth: string;
};

const arrowClass =
  "flex size-10 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

/** The month lives in the URL (?month=YYYY-MM); the current month has no param. */
export function budgetsHref(month: string, currentMonth: string) {
  return month === currentMonth ? "/app/budgets" : `/app/budgets?month=${month}`;
}

export function MonthSelector({ month, currentMonth }: MonthSelectorProps) {
  const previous = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);
  const label = formatMonth(month, { month: "long", year: "numeric" });

  return (
    <nav aria-label="Budget month" className="flex flex-wrap items-center gap-2">
      <Link
        href={budgetsHref(previous, currentMonth)}
        aria-label={`Previous month, ${formatMonth(previous, { month: "long", year: "numeric" })}`}
        className={arrowClass}
      >
        <ChevronLeft className="size-5" aria-hidden />
      </Link>
      <p
        aria-live="polite"
        className="min-w-40 text-center text-lg font-semibold text-zinc-900 dark:text-zinc-50"
      >
        {label}
      </p>
      <Link
        href={budgetsHref(next, currentMonth)}
        aria-label={`Next month, ${formatMonth(next, { month: "long", year: "numeric" })}`}
        className={arrowClass}
      >
        <ChevronRight className="size-5" aria-hidden />
      </Link>
      {month !== currentMonth ? (
        <Link
          href="/app/budgets"
          className="ml-1 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          Back to current month
        </Link>
      ) : null}
    </nav>
  );
}
