import { parseDateOnly, toDateOnlyString } from "@/lib/dates";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, type TransactionFilters } from "@/lib/transaction-filters";

const listItemSelect = {
  id: true,
  type: true,
  amount: true,
  date: true,
  note: true,
  categoryId: true,
  category: { select: { name: true, color: true, icon: true } },
} satisfies Prisma.TransactionSelect;

function toListItem(row: Prisma.TransactionGetPayload<{ select: typeof listItemSelect }>) {
  return { ...row, date: toDateOnlyString(row.date) };
}

/** Escapes LIKE wildcards so a search for "50%" or "_" matches literally. */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function buildWhere(userId: string, filters: TransactionFilters): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.type) where.type = filters.type;
  if (filters.categories.length > 0) where.categoryId = { in: filters.categories };

  if (filters.from || filters.to) {
    where.date = {
      ...(filters.from ? { gte: parseDateOnly(filters.from) } : {}),
      ...(filters.to ? { lte: parseDateOnly(filters.to) } : {}),
    };
  }

  if (filters.min !== null || filters.max !== null) {
    where.amount = {
      ...(filters.min !== null ? { gte: filters.min } : {}),
      ...(filters.max !== null ? { lte: filters.max } : {}),
    };
  }

  if (filters.q) {
    // Prisma passes `contains` to ILIKE without escaping % and _.
    const search = escapeLike(filters.q);
    where.OR = [
      { note: { contains: search, mode: "insensitive" } },
      { category: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  return where;
}

function buildOrderBy(sort: TransactionFilters["sort"]): Prisma.TransactionOrderByWithRelationInput[] {
  // createdAt/id keep the order stable between pages when dates or amounts tie.
  switch (sort) {
    case "date-asc":
      return [{ date: "asc" }, { createdAt: "asc" }, { id: "asc" }];
    case "amount-desc":
      return [{ amount: "desc" }, { date: "desc" }, { id: "desc" }];
    case "amount-asc":
      return [{ amount: "asc" }, { date: "desc" }, { id: "desc" }];
    default:
      return [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }];
  }
}

/** One page of the user's transactions plus totals for the whole filtered set. */
export async function getTransactionsPage(userId: string, filters: TransactionFilters) {
  const where = buildWhere(userId, filters);

  const [total, sums] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.groupBy({ by: ["type"], where, _sum: { amount: true } }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // A stale link (or deleting the last row of the last page) can point past the end.
  const page = Math.min(filters.page, pageCount);

  const rows = await prisma.transaction.findMany({
    where,
    orderBy: buildOrderBy(filters.sort),
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: listItemSelect,
  });

  const income = sums.find((sum) => sum.type === "INCOME")?._sum.amount ?? 0;
  const expense = sums.find((sum) => sum.type === "EXPENSE")?._sum.amount ?? 0;

  return {
    transactions: rows.map(toListItem),
    total,
    page,
    pageCount,
    summary: { income, expense, net: income - expense },
  };
}

export type TransactionsPage = Awaited<ReturnType<typeof getTransactionsPage>>;
export type TransactionListItem = TransactionsPage["transactions"][number];

/** The user's latest transactions, newest first. */
export async function getRecentTransactions(userId: string, limit = 8) {
  const rows = await prisma.transaction.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    take: limit,
    select: listItemSelect,
  });
  return rows.map(toListItem);
}
