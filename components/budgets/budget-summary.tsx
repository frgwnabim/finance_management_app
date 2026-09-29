import { BudgetProgressBar, BudgetStatusLabel } from "@/components/budgets/budget-progress";
import { Card } from "@/components/ui/card";
import type { BudgetMonth } from "@/lib/data/budgets";
import { getBudgetRatio } from "@/lib/budgets";
import { formatMonth } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { cn, pluralize } from "@/lib/utils";

export function BudgetSummary({ month, totals }: Pick<BudgetMonth, "month" | "totals">) {
  const monthName = formatMonth(month, { month: "long" });

  if (totals.budgetCount === 0) {
    return (
      <Card className="mb-6">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          No budgets for {monthName} yet
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Set a limit for any category below, or copy last month&apos;s budgets.
        </p>
      </Card>
    );
  }

  const remaining = totals.budget - totals.spent;
  const percent = Math.round(getBudgetRatio(totals.spent, totals.budget) * 100);

  return (
    <Card as="section" aria-label={`Budget summary for ${monthName}`} className="mb-6">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Figure label="Total budget" value={formatRupiah(totals.budget)} />
        <Figure label="Spent" value={formatRupiah(totals.spent)} />
        <Figure
          label={remaining < 0 ? "Over budget" : "Remaining"}
          value={formatRupiah(Math.abs(remaining))}
          valueClassName={remaining < 0 ? "text-red-600 dark:text-red-400" : undefined}
          className="col-span-2 sm:col-span-1"
        />
      </dl>
      <BudgetProgressBar
        spent={totals.spent}
        amount={totals.budget}
        label={`Total budget used in ${monthName}`}
        className="mt-5 h-3"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">
          {percent}% of your budget used across {pluralize(totals.budgetCount, "category", "categories")}
        </span>
        <BudgetStatusLabel spent={totals.spent} amount={totals.budget} />
      </div>
      {totals.unbudgetedSpent > 0 ? (
        <p className="mt-3 border-t border-zinc-200 pt-3 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Plus {formatRupiah(totals.unbudgetedSpent)} spent in categories without a budget.
        </p>
      ) : null}
    </Card>
  );
}

function Figure({
  label,
  value,
  valueClassName,
  className,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd
        className={cn(
          "mt-1 truncate text-xl font-semibold text-zinc-900 sm:text-2xl dark:text-zinc-50",
          valueClassName,
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
