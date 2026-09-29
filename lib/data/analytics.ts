import { daysBetween, getPeriodRange, type Period } from "@/lib/analytics";
import { getBudgetRatio } from "@/lib/budgets";
import { getMonthRange, parseDateOnly, toDateOnlyString, toMonthKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

// All aggregation happens in Postgres (GROUP BY / groupBy); only one row
// per month, day or category comes back, never individual transactions.

const TOP_CATEGORIES = 5;

type MonthlyRow = { month: string; type: "INCOME" | "EXPENSE"; total: bigint };

export async function getAnalytics(userId: string, period: Period, today: string) {
  const range = getPeriodRange(period, today);
  const dateFilter = { gte: parseDateOnly(range.from), lte: parseDateOnly(range.to) };
  const budgetMonth = toMonthKey(today);
  const budgetRange = getMonthRange(budgetMonth);

  const [monthlyRows, dailyRows, categoryRows, budgets, budgetSpentRows] = await Promise.all([
    // Income and expense per month. Dates are cast from text so the
    // comparison stays date-to-date regardless of the session time zone.
    prisma.$queryRaw<MonthlyRow[]>`
      SELECT to_char("date", 'YYYY-MM') AS month,
             "type"::text AS type,
             SUM("amount")::bigint AS total
      FROM "Transaction"
      WHERE "userId" = ${userId}
        AND "date" BETWEEN ${range.from}::date AND ${range.to}::date
      GROUP BY 1, 2
    `,
    // Daily spending, only needed for the single-month trend.
    period === "this-month"
      ? prisma.transaction.groupBy({
          by: ["date"],
          where: { userId, type: "EXPENSE", date: dateFilter },
          _sum: { amount: true },
        })
      : Promise.resolve([]),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "EXPENSE", date: dateFilter },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.budget.findMany({
      where: { userId, month: budgetMonth },
      select: { categoryId: true, amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: parseDateOnly(budgetRange.from), lte: parseDateOnly(budgetRange.to) },
      },
      _sum: { amount: true },
    }),
  ]);

  const categoryIds = new Set([
    ...categoryRows.map((row) => row.categoryId),
    ...budgets.map((budget) => budget.categoryId),
  ]);
  const categories = await prisma.category.findMany({
    where: { userId, id: { in: [...categoryIds] } },
    select: { id: true, name: true, color: true, icon: true },
  });
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  // Monthly income / expense / net, with empty months filled in.
  const monthly = range.months.map((month) => {
    const total = (type: MonthlyRow["type"]) =>
      Number(monthlyRows.find((row) => row.month === month && row.type === type)?.total ?? 0);
    const income = total("INCOME");
    const expense = total("EXPENSE");
    return { month, income, expense, net: income - expense };
  });
  const income = monthly.reduce((sum, row) => sum + row.income, 0);
  const expense = monthly.reduce((sum, row) => sum + row.expense, 0);

  // Daily spending up to today (future days would draw a misleading flat tail).
  const lastDay = today < range.to ? today : range.to;
  const dailyTotals = new Map(
    dailyRows.map((row) => [toDateOnlyString(row.date), row._sum.amount ?? 0]),
  );
  const daily =
    period === "this-month"
      ? Array.from({ length: daysBetween(range.from, lastDay) }, (_, index) => {
          const date = toDateOnlyString(
            new Date(parseDateOnly(range.from).getTime() + index * 86_400_000),
          );
          return { date, total: dailyTotals.get(date) ?? 0 };
        })
      : [];

  // Spending by category: top N plus an "Other" slice folding the rest.
  const byCategory = categoryRows.map((row) => ({
    categoryId: row.categoryId,
    total: row._sum.amount ?? 0,
    category: categoryById.get(row.categoryId),
  }));
  const top = byCategory.slice(0, TOP_CATEGORIES);
  const rest = byCategory.slice(TOP_CATEGORIES);
  const spendingByCategory = [
    ...top.map((row) => ({
      key: row.categoryId,
      name: row.category?.name ?? "Unknown",
      color: row.category?.color ?? "#64748b",
      icon: row.category?.icon ?? "ellipsis",
      total: row.total,
      categoryIds: [row.categoryId],
    })),
    ...(rest.length > 0
      ? [
          {
            key: "other",
            name: `Other (${rest.length})`,
            color: "#a1a1aa",
            icon: "ellipsis",
            total: rest.reduce((sum, row) => sum + row.total, 0),
            categoryIds: rest.map((row) => row.categoryId),
          },
        ]
      : []),
  ];

  // Budget vs actual for the current month, most used first.
  const spentByCategory = new Map(
    budgetSpentRows.map((row) => [row.categoryId, row._sum.amount ?? 0]),
  );
  const budgetRows = budgets
    .map((budget) => {
      const actual = spentByCategory.get(budget.categoryId) ?? 0;
      return {
        categoryId: budget.categoryId,
        name: categoryById.get(budget.categoryId)?.name ?? "Unknown",
        budget: budget.amount,
        actual,
        ratio: getBudgetRatio(actual, budget.amount),
      };
    })
    .sort((a, b) => b.ratio - a.ratio);

  const biggest = byCategory[0];
  const daysElapsed = daysBetween(range.from, lastDay);

  return {
    range,
    budgetMonth,
    monthly,
    daily,
    spendingByCategory,
    budgetRows,
    totals: { income, expense, net: income - expense },
    insights: {
      biggestCategory: biggest?.category
        ? {
            ...biggest.category,
            total: biggest.total,
            share: expense > 0 ? biggest.total / expense : 0,
          }
        : null,
      averageDaily: daysElapsed > 0 ? Math.round(expense / daysElapsed) : 0,
      daysElapsed,
      savingsRate: income > 0 ? (income - expense) / income : null,
    },
  };
}

export type Analytics = Awaited<ReturnType<typeof getAnalytics>>;
