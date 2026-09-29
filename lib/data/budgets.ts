import { getMonthRange, parseDateOnly, shiftMonth } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

/**
 * Everything the Budgets page needs for one month: every expense category
 * with its budget (if any) and what was spent, plus totals and how many of
 * last month's budgets could be copied over.
 */
export async function getBudgetMonth(userId: string, month: string) {
  const { from, to } = getMonthRange(month);
  const previousMonth = shiftMonth(month, -1);

  const [categories, budgets, spentRows, previousBudgets] = await Promise.all([
    prisma.category.findMany({
      where: { userId, type: "EXPENSE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true, icon: true },
    }),
    prisma.budget.findMany({
      where: { userId, month },
      select: { id: true, categoryId: true, amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: parseDateOnly(from), lte: parseDateOnly(to) },
      },
      _sum: { amount: true },
    }),
    prisma.budget.findMany({
      where: { userId, month: previousMonth },
      select: { categoryId: true },
    }),
  ]);

  const budgetByCategory = new Map(budgets.map((budget) => [budget.categoryId, budget]));
  const spentByCategory = new Map(
    spentRows.map((row) => [row.categoryId, row._sum.amount ?? 0]),
  );

  const rows = categories.map((category) => ({
    category,
    budget: budgetByCategory.get(category.id) ?? null,
    spent: spentByCategory.get(category.id) ?? 0,
  }));
  const budgeted = rows.filter((row) => row.budget !== null);
  const unbudgeted = rows.filter((row) => row.budget === null);
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

  return {
    month,
    // Categories with a budget first, then the rest; each group by name.
    rows: [...budgeted, ...unbudgeted],
    totals: {
      budget: sum(budgeted.map((row) => row.budget?.amount ?? 0)),
      spent: sum(budgeted.map((row) => row.spent)),
      unbudgetedSpent: sum(unbudgeted.map((row) => row.spent)),
      budgetCount: budgeted.length,
    },
    previousMonth,
    copyableCount: previousBudgets.filter((budget) => !budgetByCategory.has(budget.categoryId))
      .length,
  };
}

export type BudgetMonth = Awaited<ReturnType<typeof getBudgetMonth>>;
export type BudgetRow = BudgetMonth["rows"][number];
