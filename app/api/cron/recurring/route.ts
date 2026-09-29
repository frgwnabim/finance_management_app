import { isCronRequest } from "@/lib/cron-auth";
import { generateRecurringTransactions } from "@/lib/recurring";

// Always run on request; never cache or prerender this route.
export const dynamic = "force-dynamic";

/** Daily job (see vercel.json): generates due recurring transactions for all users. */
export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await generateRecurringTransactions();
  return Response.json({ ok: true, ...result });
}
