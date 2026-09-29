import { isCronRequest } from "@/lib/cron-auth";
import { resetDemoData } from "@/lib/demo";

export const dynamic = "force-dynamic";

/** Daily job (see vercel.json): restores the demo account so visitors can't break it for good. */
export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await resetDemoData();
  return Response.json({ ok: true, transactions: result.transactions });
}
