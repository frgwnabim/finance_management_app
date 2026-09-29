import { CircleAlert, CircleCheck, PiggyBank, TriangleAlert } from "lucide-react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getBudgetOverview, type BudgetOverviewItem } from "@/lib/data/dashboard";
import { formatMonth } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { cn } from "@/lib/utils";

const WARNING_RATIO = 0.8;

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
            <BudgetMeter key={item.id} item={item} />
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

function getStatus(ratio: number) {
  if (ratio > 1) {
    return {
      label: "Over budget",
      icon: TriangleAlert,
      text: "text-red-600 dark:text-red-400",
      fill: "bg-red-500",
      track: "bg-red-100 dark:bg-red-500/15",
    };
  }
  if (ratio >= WARNING_RATIO) {
    return {
      label: "Close to limit",
      icon: CircleAlert,
      text: "text-amber-700 dark:text-amber-400",
      fill: "bg-amber-500",
      track: "bg-amber-100 dark:bg-amber-500/15",
    };
  }
  return {
    label: "On track",
    icon: CircleCheck,
    text: "text-emerald-700 dark:text-emerald-400",
    fill: "bg-emerald-500",
    track: "bg-emerald-100 dark:bg-emerald-500/15",
  };
}

function BudgetMeter({ item }: { item: BudgetOverviewItem }) {
  const status = getStatus(item.ratio);
  const percent = Math.round(item.ratio * 100);
  const remaining = item.amount - item.spent;
  const StatusIcon = status.icon;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <CategoryIcon icon={item.category.icon} color={item.category.color} size="sm" />
        <span className="min-w-0 flex-1 truncate font-medium text-zinc-900 dark:text-zinc-50">
          {item.category.name}
        </span>
        <span className="text-sm font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
          {percent}%
        </span>
      </div>

      {/* The track is a lighter step of the fill's own hue. */}
      <div
        role="meter"
        aria-label={`${item.category.name} budget used`}
        aria-valuemin={0}
        aria-valuemax={item.amount}
        aria-valuenow={Math.min(item.spent, item.amount)}
        aria-valuetext={`${formatRupiah(item.spent)} of ${formatRupiah(item.amount)}, ${status.label.toLowerCase()}`}
        className={cn("h-2 overflow-hidden rounded-full", status.track)}
      >
        <div
          className={cn("h-full rounded-full", status.fill)}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">
          {formatRupiah(item.spent)} of {formatRupiah(item.amount)}
        </span>
        <span className={cn("inline-flex items-center gap-1 font-medium", status.text)}>
          <StatusIcon className="size-4" aria-hidden />
          {remaining < 0 ? `${formatRupiah(-remaining)} over` : status.label}
        </span>
      </div>
    </li>
  );
}
