// Pure date math for recurring items (no database), shared by the server
// generator in lib/recurring.ts and the form preview in the browser.
// All dates are date-only "YYYY-MM-DD" strings.

export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export type Schedule = {
  frequency: Frequency;
  startDate: string;
  endDate: string | null;
};

const pad = (value: number) => String(value).padStart(2, "0");
const format = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

function parse(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function addDays(date: string, days: number) {
  const { year, month, day } = parse(date);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return format(result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate());
}

/**
 * The n-th occurrence (0 = start date). Monthly and yearly items stay anchored
 * to the start date's day: a 31st falls on the last day of shorter months
 * (Feb 28/29, Apr 30) and returns to the 31st afterwards; Feb 29 falls on
 * Feb 28 in non-leap years.
 */
export function getOccurrence(startDate: string, frequency: Frequency, n: number) {
  const { year, month, day } = parse(startDate);
  switch (frequency) {
    case "DAILY":
      return addDays(startDate, n);
    case "WEEKLY":
      return addDays(startDate, 7 * n);
    case "MONTHLY": {
      const monthIndex = month - 1 + n;
      const targetYear = year + Math.floor(monthIndex / 12);
      const targetMonth = (monthIndex % 12) + 1;
      return format(targetYear, targetMonth, Math.min(day, daysInMonth(targetYear, targetMonth)));
    }
    case "YEARLY": {
      const targetYear = year + n;
      return format(targetYear, month, Math.min(day, daysInMonth(targetYear, month)));
    }
  }
}

// Guards against runaway loops; ~27 years of daily occurrences.
const MAX_ITERATIONS = 10_000;

/**
 * Occurrence dates after `after` (exclusive; null = from the start date) up to
 * `until` and the end date (inclusive), oldest first, at most `limit`.
 */
export function getDueDates(schedule: Schedule, after: string | null, until: string, limit = Infinity) {
  const last = schedule.endDate && schedule.endDate < until ? schedule.endDate : until;
  const dates: string[] = [];
  for (let n = 0; n < MAX_ITERATIONS && dates.length < limit; n++) {
    const date = getOccurrence(schedule.startDate, schedule.frequency, n);
    if (date > last) break;
    if (after === null || date > after) dates.push(date);
  }
  return dates;
}

/** First occurrence strictly after `after`, or null if the schedule has ended. */
export function getNextOccurrence(schedule: Schedule, after: string) {
  for (let n = 0; n < MAX_ITERATIONS; n++) {
    const date = getOccurrence(schedule.startDate, schedule.frequency, n);
    if (schedule.endDate && date > schedule.endDate) return null;
    if (date > after) return date;
  }
  return null;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Every month on day 31 (or the last day)", "Every week on Monday", ... */
export function describeSchedule(frequency: Frequency, startDate: string) {
  const { year, month, day } = parse(startDate);
  switch (frequency) {
    case "DAILY":
      return "Every day";
    case "WEEKLY":
      return `Every week on ${WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]}`;
    case "MONTHLY":
      return day > 28 ? `Every month on day ${day} (or the last day)` : `Every month on day ${day}`;
    case "YEARLY":
      return `Every year on ${day} ${MONTHS[month - 1]}`;
  }
}
