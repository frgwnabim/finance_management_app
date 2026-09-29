import { parseDateOnly, toDateOnlyString, todayInAppTimeZone } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { getDueDates } from "@/lib/recurring-schedule";

/**
 * Upper bound of transactions created per item per run. A long backlog
 * (e.g. a daily item started years ago) continues on the next run.
 */
const MAX_PER_RUN = 500;

type GenerationResult = { items: number; created: number };

/**
 * Creates every transaction that is due up to `today` for each active
 * recurring item (of one user, or of everyone when userId is omitted), then
 * moves the item's lastGeneratedDate to the last date created.
 *
 * Idempotent, even when two runs overlap (e.g. the cron and a user opening
 * the app): each item is claimed with a compare-and-swap on
 * lastGeneratedDate inside the same database transaction as the inserts.
 * A run that loses the race updates 0 rows and inserts nothing.
 */
export async function generateRecurringTransactions({
  userId,
  today = todayInAppTimeZone(),
}: { userId?: string; today?: string } = {}): Promise<GenerationResult> {
  const items = await prisma.recurringTransaction.findMany({
    where: {
      isActive: true,
      ...(userId ? { userId } : {}),
      startDate: { lte: parseDateOnly(today) },
    },
    select: {
      id: true,
      userId: true,
      categoryId: true,
      type: true,
      amount: true,
      note: true,
      frequency: true,
      startDate: true,
      endDate: true,
      lastGeneratedDate: true,
    },
  });

  let created = 0;
  for (const item of items) {
    const after = item.lastGeneratedDate ? toDateOnlyString(item.lastGeneratedDate) : null;
    const dates = getDueDates(
      {
        frequency: item.frequency,
        startDate: toDateOnlyString(item.startDate),
        endDate: item.endDate ? toDateOnlyString(item.endDate) : null,
      },
      after,
      today,
      MAX_PER_RUN,
    );
    if (dates.length === 0) continue;

    created += await prisma.$transaction(async (tx) => {
      // Claim: only succeeds if nobody generated this item since we read it.
      const { count } = await tx.recurringTransaction.updateMany({
        where: { id: item.id, isActive: true, lastGeneratedDate: item.lastGeneratedDate },
        data: { lastGeneratedDate: parseDateOnly(dates[dates.length - 1]) },
      });
      if (count === 0) return 0;

      const result = await tx.transaction.createMany({
        data: dates.map((date) => ({
          userId: item.userId,
          categoryId: item.categoryId,
          type: item.type,
          amount: item.amount,
          note: item.note,
          date: parseDateOnly(date),
          recurringId: item.id,
        })),
      });
      return result.count;
    });
  }

  return { items: items.length, created };
}
