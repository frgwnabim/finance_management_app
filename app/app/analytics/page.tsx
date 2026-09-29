import { ChartColumn, ChartPie, PiggyBank } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BudgetChart } from "@/components/analytics/budget-chart";
import { CategoryDonut } from "@/components/analytics/category-donut";
import { IncomeExpenseChart } from "@/components/analytics/income-expense-chart";
import { InsightCards } from "@/components/analytics/insight-cards";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { SpendingTrend } from "@/components/analytics/spending-trend";
import { ChartTable } from "@/components/charts/chart-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PendingNavigationProvider, PendingRegion } from "@/components/ui/pending-navigation";
import { parsePeriod, PERIODS, transactionsHrefFor } from "@/lib/analytics";
import { getAnalytics } from "@/lib/data/analytics";
import { formatDateOnly, formatMonth, todayInAppTimeZone } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Analytics" };

const LONG_MONTH: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };

export default async function AnalyticsPage({ searchParams }: PageProps<"/app/analytics">) {
  const user = await requireUser();
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);
  const today = todayInAppTimeZone();
  const data = await getAnalytics(user.id, period, today);

  const isDaily = period === "this-month";
  const periodLabel = PERIODS[period].label.toLowerCase();
  const rangeLabel = `${formatDateOnly(data.range.from, { day: "numeric", month: "short", year: "numeric" })} to ${formatDateOnly(data.range.to, { day: "numeric", month: "short", year: "numeric" })}`;

  const trendPoints = isDaily
    ? data.daily.map((day) => ({
        key: day.date,
        label: formatDateOnly(day.date, { day: "numeric" }),
        fullLabel: formatDateOnly(day.date),
        total: day.total,
      }))
    : data.monthly.map((month) => ({
        key: month.month,
        label: formatMonth(month.month),
        fullLabel: formatMonth(month.month, LONG_MONTH),
        total: month.expense,
      }));

  const monthlyPoints = data.monthly.map((month) => ({
    ...month,
    label: formatMonth(month.month),
    fullLabel: formatMonth(month.month, LONG_MONTH),
  }));

  const slices = data.spendingByCategory.map((slice) => ({
    key: slice.key,
    name: slice.name,
    color: slice.color,
    total: slice.total,
    href: transactionsHrefFor(period, data.range, slice.categoryIds),
  }));

  const budgetMonthLabel = formatMonth(data.budgetMonth, LONG_MONTH);

  return (
    <PendingNavigationProvider>
      <PageHeader title="Analytics" description={`Where your money went, ${rangeLabel}.`} />
      <PeriodSelector period={period} />

      <PendingRegion>
        <InsightCards insights={data.insights} totals={data.totals} />

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Spending by category</CardTitle>
              <CardDescription>Click a slice to see its transactions</CardDescription>
            </CardHeader>
            {slices.length > 0 ? (
              <>
                <CategoryDonut slices={slices} total={data.totals.expense} />
                <ChartTable
                  caption={`Spending by category, ${periodLabel}`}
                  columns={["Category", "Amount", "Share"]}
                  rows={slices.map((slice) => ({
                    key: slice.key,
                    cells: [
                      slice.name,
                      formatRupiah(slice.total),
                      `${((slice.total / data.totals.expense) * 100).toFixed(1)}%`,
                    ],
                  }))}
                />
              </>
            ) : (
              <EmptyState icon={ChartPie} title="No spending in this period" className="border-none py-10" />
            )}
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Spending trend</CardTitle>
              <CardDescription>{isDaily ? "Daily expenses this month" : `Monthly expenses, ${periodLabel}`}</CardDescription>
            </CardHeader>
            {data.totals.expense > 0 ? (
              <>
                <SpendingTrend points={trendPoints} daily={isDaily} />
                <ChartTable
                  caption="Spending trend"
                  columns={[isDaily ? "Day" : "Month", "Spending"]}
                  rows={trendPoints.map((point) => ({
                    key: point.key,
                    cells: [point.fullLabel, formatRupiah(point.total)],
                  }))}
                />
              </>
            ) : (
              <EmptyState icon={ChartColumn} title="No spending in this period" className="border-none py-10" />
            )}
          </Card>
        </div>

        <Card className="mb-6 min-w-0">
          <CardHeader>
            <CardTitle>Income vs expense</CardTitle>
            <CardDescription>Per month, with net savings. Click the legend to hide a series.</CardDescription>
          </CardHeader>
          <IncomeExpenseChart points={monthlyPoints} />
          <ChartTable
            caption={`Income, expense and net savings per month, ${periodLabel}`}
            columns={["Month", "Income", "Expense", "Net savings"]}
            rows={monthlyPoints.map((point) => ({
              key: point.month,
              cells: [point.fullLabel, formatRupiah(point.income), formatRupiah(point.expense), formatRupiah(point.net)],
            }))}
          />
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Budget tracking</CardTitle>
            <CardDescription>Budget vs actual spending, {budgetMonthLabel}</CardDescription>
          </CardHeader>
          {data.budgetRows.length > 0 ? (
            <>
              <BudgetChart
                points={data.budgetRows.map((row) => ({
                  key: row.categoryId,
                  name: row.name,
                  budget: row.budget,
                  actual: row.actual,
                }))}
              />
              <ChartTable
                caption={`Budget vs actual, ${budgetMonthLabel}`}
                columns={["Category", "Budget", "Actual", "Used"]}
                rows={data.budgetRows.map((row) => ({
                  key: row.categoryId,
                  cells: [row.name, formatRupiah(row.budget), formatRupiah(row.actual), `${Math.round(row.ratio * 100)}%`],
                }))}
              />
            </>
          ) : (
            <EmptyState
              icon={PiggyBank}
              title={`No budgets for ${budgetMonthLabel}`}
              action={
                <Link href="/app/budgets" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
                  Set budgets
                </Link>
              }
              className="border-none py-10"
            />
          )}
        </Card>
      </PendingRegion>
    </PendingNavigationProvider>
  );
}
