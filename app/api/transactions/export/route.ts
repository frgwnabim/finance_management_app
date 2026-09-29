import { auth } from "@/auth";
import { TRANSACTION_TYPE_LABELS } from "@/lib/categories";
import { CSV_BOM, toCsvRow } from "@/lib/csv";
import { iterateTransactionsForExport } from "@/lib/data/transactions";
import { todayInAppTimeZone } from "@/lib/dates";
import { parseTransactionFilters, searchParamsToRecord } from "@/lib/transaction-filters";

export const dynamic = "force-dynamic";

const HEADER = ["date", "type", "category", "amount", "note"];

/**
 * CSV of the signed-in user's transactions matching the Transactions page
 * query params (search, filters, sort). Pagination is ignored: every
 * matching row is exported. Streams rows as they're read from the database.
 */
export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const filters = parseTransactionFilters(searchParamsToRecord(params));
  const batches = iterateTransactionsForExport(userId, filters);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(CSV_BOM + toCsvRow(HEADER)));
    },
    async pull(controller) {
      try {
        const { value, done } = await batches.next();
        if (done) {
          controller.close();
          return;
        }
        const lines = value.map((row) =>
          toCsvRow([row.date, TRANSACTION_TYPE_LABELS[row.type], row.category.name, row.amount, row.note]),
        );
        controller.enqueue(encoder.encode(lines.join("")));
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      await batches.return(undefined);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions_${todayInAppTimeZone()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
