// Transaction dates are date-only values (Postgres DATE). Prisma represents
// them as a Date at UTC midnight, so always read and format them in UTC.

const pad = (value: number) => String(value).padStart(2, "0");

/** DB date -> "YYYY-MM-DD" */
export function toDateOnlyString(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" -> Date to store in a @db.Date column */
export function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Today in the browser's local timezone as "YYYY-MM-DD". Call on the client. */
export function todayLocal() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "2026-09-29" -> "Tue, 29 Sept 2026" (or other Intl options) */
export function formatDateOnly(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(
    parseDateOnly(value),
  );
}

// Month helpers. A month key is "YYYY-MM" (also the Budget.month format).

/**
 * The app's reference time zone for server-side "today" / "this month".
 * The server can't know the viewer's zone; this app targets Indonesia (IDR).
 */
export const APP_TIME_ZONE = "Asia/Jakarta";

/** Today as "YYYY-MM-DD" in APP_TIME_ZONE. */
export function todayInAppTimeZone(now = new Date()) {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "2026-09-29" -> "2026-09" */
export function toMonthKey(date: string) {
  return date.slice(0, 7);
}

/** shiftMonth("2026-01", -1) -> "2025-12" */
export function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

/** First and last day of a month: "2024-02" -> 2024-02-01 .. 2024-02-29 */
export function getMonthRange(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { from: `${monthKey}-01`, to: `${monthKey}-${pad(lastDay)}` };
}

/** "2026-09" -> "Sept" (or other Intl options) */
export function formatMonth(
  monthKey: string,
  options: Intl.DateTimeFormatOptions = { month: "short" },
) {
  return formatDateOnly(`${monthKey}-01`, options);
}
