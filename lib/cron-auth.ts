import { timingSafeEqual } from "node:crypto";

/** True when the request carries "Authorization: Bearer <CRON_SECRET>" (sent by Vercel Cron). */
export function isCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
