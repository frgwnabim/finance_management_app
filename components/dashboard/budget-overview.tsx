import { PiggyBank } from "lucide-react";

import { BudgetProgressBar, BudgetStatusLabel } from "@/components/budgets/budget-progress";
import { CategoryIcon } from "@/components/categories/category-icon";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getBudgetOverview, type BudgetOverviewItem } from "@/lib/data/dashboard";
import { formatMonth } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";

/** Hidden entirely until the user has set at least one budget. */
export async function BudgetOverview({ userId, today }: { userId: string; today: string }) {
  const overview = await getBudgetOverview(userId, today);
  if (!overview) return null;

  const monthName = formatMonth(overview.month, { month: "long" });

  return (
    <Card>
      <SectionHeader
        title="Budgets this month"
        description="Categories closest to their limit"
        href="/app/budgets"
        linkLabel="View budgets"
      />
      {overview.items.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-3">
          {overview.items.map((item) => (
            <BudgetCard key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={PiggyBank}
          title={`No budgets for ${monthName}`}
          description="Set a monthly limit for a category to track it here."
          className="border-none py-8"
        />
      )}
    </Card>
  );
}

function BudgetCard({ item }: { item: BudgetOverviewItem }) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <CategoryIcon icon={item.category.icon} color={item.category.color} size="sm" />
        <span className="min-w-0 flex-1 truncate font-medium text-zinc-900 dark:text-zinc-50">
          {item.category.name}
        </span>
        <span className="text-sm font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
          {Math.round(item.ratio * 100)}%
        </span>
      </div>
      <BudgetProgressBar
        spent={item.spent}
        amount={item.amount}
        label={`${item.category.name} budget used`}
      />
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">
          {formatRupiah(item.spent)} of {formatRupiah(item.amount)}
        </span>
        <BudgetStatusLabel spent={item.spent} amount={item.amount} />
      </div>
    </li>
  );
}
