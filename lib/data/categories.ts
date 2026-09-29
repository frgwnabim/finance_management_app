import { prisma } from "@/lib/prisma";

/** All categories of a user with usage counts, for the management page. */
export async function getCategoriesWithUsage(userId: string) {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      color: true,
      icon: true,
      _count: {
        select: { transactions: true, recurringTransactions: true, budgets: true },
      },
    },
  });

  return categories.map(({ _count, ...category }) => ({
    ...category,
    transactionCount: _count.transactions,
    recurringCount: _count.recurringTransactions,
    budgetCount: _count.budgets,
  }));
}

export type CategoryWithUsage = Awaited<
  ReturnType<typeof getCategoriesWithUsage>
>[number];
