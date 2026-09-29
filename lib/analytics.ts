import { getMonthRange, shiftMonth, toMonthKey } from "@/lib/dates";
import { DEFAULT_FILTERS, toQueryString } from "@/lib/transaction-filters";

export const PERIODS = {
  "this-month": { label: "This month", shortLabel: "This month", months: 1 },
  "3m": { label: "Last 3 months", shortLabel: "3M", months: 3 },
  "6m": { label: "Last 6 months", shortLabel: "6M", months: 6 },
  "12m": { label: "Last 12 months", shortLabel: "12M", months: 12 },
} as const;

export type Period = keyof typeof PERIODS;
export const DEFAULT_PERIOD: Period = "this-month";

export function parsePeriod(value: unknown): Period {
  return typeof value === "string" && Object.hasOwn(PERIODS, value)
    ? (value as Period)
    : DEFAULT_PERIOD;
}

export function analyticsHref(period: Period) {
  return period === DEFAULT_PERIOD ? "/app/analytics" : `/app/analytics?period=${period}`;
}

/**
 * A period is the current month plus the months before it (same meaning as
 * the Transactions page presets). `today` is "YYYY-MM-DD".
 */
export function getPeriodRange(period: Period, today: string) {
  const current = toMonthKey(today);
  const count = PERIODS[period].months;
  const months = Array.from({ length: count }, (_, index) =>
    shiftMonth(current, index - (count - 1)),
  );
  return {
    from: getMonthRange(months[0]).from,
    to: getMonthRange(current).to,
    months,
  };
}

/** Transactions page link for expenses in some categories over a period. */
export function transactionsHrefFor(
  period: Period,
  range: { from: string; to: string },
  categoryIds: string[],
) {
  const rangeKey =
    period === "this-month" ? "this-month" : period === "3m" ? "last-3-months" : "custom";
  return `/app/transactions${toQueryString({
    ...DEFAULT_FILTERS,
    type: "EXPENSE",
    categories: categoryIds,
    range: rangeKey,
    from: range.from,
    to: range.to,
  })}`;
}

/** Inclusive day count between two "YYYY-MM-DD" dates. */
export function daysBetween(from: string, to: string) {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.floor(ms / 86_400_000) + 1;
}
