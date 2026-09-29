import { getBudgetRatio } from "@/lib/budgets";
import {
  getMonthRange,
  parseDateOnly,
  shiftMonth,
  toDateOnlyString,
  toMonthKey,
} from "@/lib/dates";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Dashboard queries. `today` is "YYYY-MM-DD" in the app time zone; every
// query is scoped to the user.

async function sumByType(where: Prisma.TransactionWhereInput) {
  const rows = await prisma.transaction.groupBy({
    by: ["type"],
    where,
    _sum: { amount: true },
  });
  const sum = (type: string) => rows.find((row) => row.type === type)?._sum.amount ?? 0;
  return { income: sum("INCOME"), expense: sum("EXPENSE") };
}

function monthWhere(monthKey: string): Prisma.DateTimeFilter {
  const { from, to } = getMonthRange(monthKey);
  return { gte: parseDateOnly(from), lte: parseDateOnly(to) };
}

/** Balance now vs at the end of last month; income and expense this month vs last. */
export async function getDashboardSummary(userId: string, today: string) {
  const month = toMonthKey(today);
  const lastMonth = shiftMonth(month, -1);
  const lastMonthEnd = parseDateOnly(getMonthRange(lastMonth).to);

  const [allTime, untilLastMonth, thisMonthTotals, lastMonthTotals] = await Promise.all([
    sumByType({ userId }),
    sumByType({ userId, date: { lte: lastMonthEnd } }),
    sumByType({ userId, date: monthWhere(month) }),
    sumByType({ userId, date: monthWhere(lastMonth) }),
  ]);

  return {
    balance: {
      current: allTime.income - allTime.expense,
      previous: untilLastMonth.income - untilLastMonth.expense,
    },
    income: { current: thisMonthTotals.income, previous: lastMonthTotals.income },
    expense: { current: thisMonthTotals.expense, previous: lastMonthTotals.expense },
  };
}

/** Total expenses per month for the last `months` months, oldest first. */
export async function getMonthlySpending(userId: string, today: string, months = 6) {
  const current = toMonthKey(today);
  const keys = Array.from({ length: months }, (_, index) =>
    shiftMonth(current, index - (months - 1)),
  );

  // Grouped by day (at most ~180 rows), then folded into months here.
  const rows = await prisma.transaction.groupBy({
    by: ["date"],
    where: {
      userId,
      type: "EXPENSE",
      date: {
        gte: parseDateOnly(getMonthRange(keys[0]).from),
        lte: parseDateOnly(getMonthRange(current).to),
      },
    },
    _sum: { amount: true },
  });

  const totals = new Map(keys.map((key) => [key, 0]));
  for (const row of rows) {
    const key = toMonthKey(toDateOnlyString(row.date));
    totals.set(key, (totals.get(key) ?? 0) + (row._sum.amount ?? 0));
  }

  return keys.map((month) => ({
    month,
    total: totals.get(month) ?? 0,
    isCurrent: month === current,
  }));
}

/**
 * This month's budgets closest to (or over) their limit, highest usage first.
 * Returns null when the user has never set a budget, so the section can hide.
 */
export async function getBudgetOverview(userId: string, today: string, limit = 3) {
  const month = toMonthKey(today);

  const anyBudget = await prisma.budget.findFirst({ where: { userId }, select: { id: true } });
  if (!anyBudget) return null;

  const budgets = await prisma.budget.findMany({
    where: { userId, month },
    select: {
      id: true,
      amount: true,
      categoryId: true,
      category: { select: { name: true, color: true, icon: true } },
    },
  });
  if (budgets.length === 0) return { month, items: [] };

  const spentRows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      categoryId: { in: budgets.map((budget) => budget.categoryId) },
      date: monthWhere(month),
    },
    _sum: { amount: true },
  });
  const spentByCategory = new Map(
    spentRows.map((row) => [row.categoryId, row._sum.amount ?? 0]),
  );

  const items = budgets
    .map((budget) => {
      const spent = spentByCategory.get(budget.categoryId) ?? 0;
      return { ...budget, spent, ratio: getBudgetRatio(spent, budget.amount) };
    })
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, limit);

  return { month, items };
}

export type MonthlySpending = Awaited<ReturnType<typeof getMonthlySpending>>;
export type BudgetOverviewItem = NonNullable<
  Awaited<ReturnType<typeof getBudgetOverview>>
>["items"][number];
