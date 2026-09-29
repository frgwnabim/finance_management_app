import { getMonthRange, shiftMonth, toMonthKey } from "@/lib/dates";
import type { TransactionType } from "@/lib/generated/prisma/client";
import { MAX_AMOUNT } from "@/lib/validations/transaction";

// Transactions page state, stored in the URL so it survives refresh and can
// be shared. Parsing is forgiving: anything invalid falls back to its default.

export const PAGE_SIZE = 20;

export const DATE_RANGES = {
  all: "All time",
  "this-month": "This month",
  "last-month": "Last month",
  "last-3-months": "Last 3 months",
  custom: "Custom",
} as const;
export type DateRange = keyof typeof DATE_RANGES;
export type DatePreset = Exclude<DateRange, "all" | "custom">;

export const SORT_OPTIONS = {
  "date-desc": "Newest first",
  "date-asc": "Oldest first",
  "amount-desc": "Highest amount",
  "amount-asc": "Lowest amount",
} as const;
export type SortOption = keyof typeof SORT_OPTIONS;

export type TransactionFilters = {
  q: string;
  range: DateRange;
  from: string | null;
  to: string | null;
  type: TransactionType | null;
  categories: string[];
  min: number | null;
  max: number | null;
  sort: SortOption;
  page: number;
};

export const DEFAULT_FILTERS: TransactionFilters = {
  q: "",
  range: "all",
  from: null,
  to: null,
  type: null,
  categories: [],
  min: null,
  max: null,
  sort: "date-desc",
  page: 1,
};

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const MAX_SEARCH_LENGTH = 100;
const MAX_CATEGORIES = 50;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isKeyOf<T extends object>(object: T, key: unknown): key is keyof T {
  return typeof key === "string" && Object.hasOwn(object, key);
}

function parseDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
    ? value
    : null;
}

function parseAmount(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return null;
  const amount = Number(value);
  return amount <= MAX_AMOUNT ? amount : null;
}

export function parseTransactionFilters(params: SearchParamsRecord): TransactionFilters {
  const range = first(params.range);
  const type = first(params.type)?.toUpperCase();
  const sort = first(params.sort);
  const page = Number(first(params.page));
  const parsedRange = isKeyOf(DATE_RANGES, range) ? range : "all";

  return {
    q: (first(params.q) ?? "").trim().slice(0, MAX_SEARCH_LENGTH),
    range: parsedRange,
    // Dates only apply to a selected range; "all" ignores stray from/to.
    from: parsedRange === "all" ? null : parseDate(first(params.from)),
    to: parsedRange === "all" ? null : parseDate(first(params.to)),
    type: type === "INCOME" || type === "EXPENSE" ? type : null,
    categories: (first(params.categories) ?? "")
      .split(",")
      .filter((id) => /^[a-z0-9]{1,40}$/i.test(id))
      .slice(0, MAX_CATEGORIES),
    min: parseAmount(first(params.min)),
    max: parseAmount(first(params.max)),
    sort: isKeyOf(SORT_OPTIONS, sort) ? sort : "date-desc",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

export function searchParamsToRecord(params: URLSearchParams): SearchParamsRecord {
  return Object.fromEntries(params.entries());
}

/** Serializes filters to "?a=b" (or "" for defaults), leaving out default values. */
export function toQueryString(filters: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.range !== "all") {
    params.set("range", filters.range);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
  }
  if (filters.type) params.set("type", filters.type.toLowerCase());
  if (filters.categories.length > 0) params.set("categories", filters.categories.join(","));
  if (filters.min !== null) params.set("min", String(filters.min));
  if (filters.max !== null) params.set("max", String(filters.max));
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Number of narrowing filters in use (search and sort excluded). */
export function countActiveFilters(filters: TransactionFilters) {
  return [
    filters.range !== "all",
    filters.type !== null,
    filters.categories.length > 0,
    filters.min !== null,
    filters.max !== null,
  ].filter(Boolean).length;
}

export function hasAnyFilter(filters: TransactionFilters) {
  return filters.q !== "" || countActiveFilters(filters) > 0;
}

/**
 * Date bounds for a preset, relative to `today` ("YYYY-MM-DD", the user's
 * local date). "Last 3 months" is the current month plus the two before it.
 */
export function getPresetRange(preset: DatePreset, today: string) {
  const month = toMonthKey(today);
  switch (preset) {
    case "this-month":
      return getMonthRange(month);
    case "last-month":
      return getMonthRange(shiftMonth(month, -1));
    case "last-3-months":
      return {
        from: getMonthRange(shiftMonth(month, -2)).from,
        to: getMonthRange(month).to,
      };
  }
}
