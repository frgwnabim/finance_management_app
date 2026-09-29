import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

import { getBudgetLevel, getBudgetRatio, type BudgetLevel } from "@/lib/budgets";
import { formatRupiah } from "@/lib/money";
import { cn } from "@/lib/utils";

// Fill color carries severity; the track is a lighter step of the same hue.
const LEVEL_STYLES: Record<BudgetLevel, { fill: string; track: string; text: string }> = {
  normal: {
    fill: "bg-emerald-500",
    track: "bg-emerald-100 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  warning: {
    fill: "bg-amber-500",
    track: "bg-amber-100 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-400",
  },
  danger: {
    fill: "bg-red-500",
    track: "bg-red-100 dark:bg-red-500/15",
    text: "text-red-600 dark:text-red-400",
  },
};

type BudgetAmounts = { spent: number; amount: number };

/** Human label for the status; always shown with an icon, never color alone. */
export function getBudgetStatusText({ spent, amount }: BudgetAmounts) {
  const level = getBudgetLevel(spent, amount);
  if (level === "danger") {
    return spent > amount ? `${formatRupiah(spent - amount)} over` : "Limit reached";
  }
  return level === "warning" ? "Close to limit" : "On track";
}

export function BudgetProgressBar({
  spent,
  amount,
  label,
  className,
}: BudgetAmounts & { label: string; className?: string }) {
  const level = getBudgetLevel(spent, amount);
  const percent = Math.round(getBudgetRatio(spent, amount) * 100);
  const styles = LEVEL_STYLES[level];

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={amount}
      aria-valuenow={Math.min(spent, amount)}
      aria-valuetext={`${formatRupiah(spent)} of ${formatRupiah(amount)} (${percent}%). ${getBudgetStatusText({ spent, amount })}`}
      className={cn("h-2 overflow-hidden rounded-full", styles.track, className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width]", styles.fill)}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

const LEVEL_ICONS = { normal: CircleCheck, warning: CircleAlert, danger: TriangleAlert };

export function BudgetStatusLabel({ spent, amount, className }: BudgetAmounts & { className?: string }) {
  const level = getBudgetLevel(spent, amount);
  const Icon = LEVEL_ICONS[level];

  return (
    <span className={cn("inline-flex items-center gap-1 font-medium", LEVEL_STYLES[level].text, className)}>
      <Icon className="size-4 shrink-0" aria-hidden />
      {getBudgetStatusText({ spent, amount })}
    </span>
  );
}
