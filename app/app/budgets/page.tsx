import { Tags } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BudgetList } from "@/components/budgets/budget-list";
import { BudgetSummary } from "@/components/budgets/budget-summary";
import { CopyBudgetsButton } from "@/components/budgets/copy-budgets-button";
import { MonthSelector } from "@/components/budgets/month-selector";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { isMonthKey } from "@/lib/budgets";
import { getBudgetMonth } from "@/lib/data/budgets";
import { todayInAppTimeZone, toMonthKey } from "@/lib/dates";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Budgets" };

export default async function BudgetsPage({ searchParams }: PageProps<"/app/budgets">) {
  const user = await requireUser();
  const currentMonth = toMonthKey(todayInAppTimeZone());
  const { month: monthParam } = await searchParams;
  const month = isMonthKey(monthParam) ? monthParam : currentMonth;

  const data = await getBudgetMonth(user.id, month);

  return (
    <>
      <PageHeader
        title="Budgets"
        description="Set monthly spending limits for your expense categories."
        actions={
          <CopyBudgetsButton
            month={month}
            previousMonth={data.previousMonth}
            copyableCount={data.copyableCount}
          />
        }
      />

      <div className="mb-6">
        <MonthSelector month={month} currentMonth={currentMonth} />
      </div>

      {data.rows.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No expense categories"
          description="Budgets are set per expense category. Create one to get started."
          action={
            <Link
              href="/app/settings/categories"
              className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Manage categories
            </Link>
          }
        />
      ) : (
        <>
          <BudgetSummary month={data.month} totals={data.totals} />
          <BudgetList rows={data.rows} month={data.month} />
        </>
      )}
    </>
  );
}
