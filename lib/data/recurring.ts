import { toDateOnlyString } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { addDays, getNextOccurrence } from "@/lib/recurring-schedule";

export type RecurringStatus = "active" | "paused" | "ended";

/** Recurring items with their next due date; active first, soonest first. */
export async function getRecurringItems(userId: string, today: string) {
  const rows = await prisma.recurringTransaction.findMany({
    where: { userId },
    select: {
      id: true,
      type: true,
      amount: true,
      note: true,
      frequency: true,
      startDate: true,
      endDate: true,
      lastGeneratedDate: true,
      isActive: true,
      categoryId: true,
      category: { select: { name: true, color: true, icon: true } },
      _count: { select: { transactions: true } },
    },
  });

  const yesterday = addDays(today, -1);
  const items = rows.map(({ _count, ...row }) => {
    const schedule = {
      frequency: row.frequency,
      startDate: toDateOnlyString(row.startDate),
      endDate: row.endDate ? toDateOnlyString(row.endDate) : null,
    };
    const lastGenerated = row.lastGeneratedDate ? toDateOnlyString(row.lastGeneratedDate) : null;
    // Next date that hasn't been generated yet, today at the earliest.
    const after = lastGenerated && lastGenerated > yesterday ? lastGenerated : yesterday;
    const nextDueDate = getNextOccurrence(schedule, after);
    const status: RecurringStatus = !nextDueDate ? "ended" : row.isActive ? "active" : "paused";

    return {
      ...row,
      ...schedule,
      nextDueDate,
      status,
      generatedCount: _count.transactions,
    };
  });

  const order: Record<RecurringStatus, number> = { active: 0, paused: 1, ended: 2 };
  return items.sort(
    (a, b) =>
      order[a.status] - order[b.status] ||
      (a.nextDueDate ?? "").localeCompare(b.nextDueDate ?? "") ||
      a.category.name.localeCompare(b.category.name),
  );
}

export type RecurringItem = Awaited<ReturnType<typeof getRecurringItems>>[number];
