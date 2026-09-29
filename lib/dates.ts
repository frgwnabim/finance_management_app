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
