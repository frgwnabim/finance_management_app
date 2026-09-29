import { toDateOnlyString } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

/** Most recent transactions of a user, newest first. */
export async function getRecentTransactions(userId: string, limit = 50) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      type: true,
      amount: true,
      date: true,
      note: true,
      categoryId: true,
      category: { select: { name: true, color: true, icon: true } },
    },
  });

  return transactions.map((transaction) => ({
    ...transaction,
    date: toDateOnlyString(transaction.date),
  }));
}

export type TransactionListItem = Awaited<
  ReturnType<typeof getRecentTransactions>
>[number];
