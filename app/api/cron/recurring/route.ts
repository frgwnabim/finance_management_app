import { timingSafeEqual } from "node:crypto";

import { generateRecurringTransactions } from "@/lib/recurring";

// Always run on request; never cache or prerender this route.
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>".
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

/** Daily job (see vercel.json): generates due recurring transactions for all users. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await generateRecurringTransactions();
  return Response.json({ ok: true, ...result });
}
