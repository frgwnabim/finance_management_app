"use client";

import { LoaderCircle, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { useDebouncedUrlState } from "@/components/transactions/filters/use-debounced-url-state";
import { useTransactionFilters } from "@/components/transactions/filters/transaction-filters-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { Select } from "@/components/ui/select";
import { TRANSACTION_TYPE_LABELS } from "@/lib/categories";
import type { CategoryOption } from "@/lib/data/categories";
import { formatDateOnly, todayLocal } from "@/lib/dates";
import type { TransactionType } from "@/lib/generated/prisma/client";
import {
  countActiveFilters,
  DATE_RANGES,
  getPresetRange,
  hasAnyFilter,
  SORT_OPTIONS,
  type DateRange,
  type SortOption,
} from "@/lib/transaction-filters";
import { cn } from "@/lib/utils";

const sameTrimmed = (a: string, b: string) => a.trim() === b.trim();

function formatRange(from: string, to: string) {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${formatDateOnly(from, options)} to ${formatDateOnly(to, options)}`;
}

export function TransactionFilterBar({ categories }: { categories: CategoryOption[] }) {
  const { filters, setFilters, resetFilters, isPending } = useTransactionFilters();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const ids = {
    search: useId(),
    panel: useId(),
    range: useId(),
    from: useId(),
    to: useId(),
    type: useId(),
    categories: useId(),
    sort: useId(),
    min: useId(),
    max: useId(),
  };

  const [search, setSearch] = useDebouncedUrlState(
    filters.q,
    (q) => setFilters({ q: q.trim() }),
    { isEqual: sameTrimmed },
  );
  const [min, setMin] = useDebouncedUrlState(filters.min, (value) => setFilters({ min: value }));
  const [max, setMax] = useDebouncedUrlState(filters.max, (value) => setFilters({ max: value }));

  // A hand-written link like ?range=this-month has no dates yet: resolve them locally.
  const { range, from, to } = filters;
  useEffect(() => {
    if (range !== "all" && range !== "custom" && (!from || !to)) {
      setFilters(getPresetRange(range, todayLocal()));
    }
    // setFilters changes every render; only react to the URL values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, from, to]);

  function changeRange(next: DateRange) {
    if (next === "all") {
      setFilters({ range: next, from: null, to: null });
    } else if (next === "custom") {
      const thisMonth = getPresetRange("this-month", todayLocal());
      setFilters({ range: next, from: from ?? thisMonth.from, to: to ?? thisMonth.to });
    } else {
      setFilters({ range: next, ...getPresetRange(next, todayLocal()) });
    }
  }

  function changeType(value: string) {
    const type = value === "INCOME" || value === "EXPENSE" ? value : null;
    // Drop selected categories that don't belong to the new type.
    const allowed = new Set(
      categories.filter((c) => !type || c.type === type).map((c) => c.id),
    );
    setFilters({ type, categories: filters.categories.filter((id) => allowed.has(id)) });
  }

  const categoryOptions: MultiSelectOption[] = categories
    .filter((category) => !filters.type || category.type === filters.type)
    .toSorted((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
    .map((category) => ({
      value: category.id,
      label: category.name,
      group: filters.type ? undefined : TRANSACTION_TYPE_LABELS[category.type],
      icon: <CategoryIcon icon={category.icon} color={category.color} size="xs" />,
    }));

  const activeCount = countActiveFilters(filters);
  const canReset = hasAnyFilter(filters) || search.trim() !== "";

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor={ids.search} className="sr-only">
            Search transactions
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            id={ids.search}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            title="Search by note or category name"
            autoComplete="off"
            maxLength={100}
            className="pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden"
          />
          <span className="absolute top-1/2 right-2 -translate-y-1/2">
            {isPending ? (
              <LoaderCircle
                className="mr-1 size-4 animate-spin text-zinc-400"
                aria-label="Loading results"
              />
            ) : search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="flex size-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </span>
        </div>

        <Button
          variant="secondary"
          className="md:hidden"
          onClick={() => setShowMobileFilters((show) => !show)}
          aria-expanded={showMobileFilters}
          aria-controls={ids.panel}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
          {activeCount > 0 ? <Badge variant="success">{activeCount}</Badge> : null}
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            setSearch("");
            resetFilters();
          }}
          disabled={!canReset}
          aria-label="Reset filters"
          title="Reset filters"
          className="px-3 md:px-4"
        >
          <RotateCcw className="size-4" aria-hidden />
          <span className="hidden md:inline">Reset filters</span>
        </Button>
      </div>

      <div
        id={ids.panel}
        className={cn(
          "grid-cols-2 gap-3 lg:grid-cols-4",
          showMobileFilters ? "grid" : "hidden md:grid",
        )}
      >
        <Field label="Date range" htmlFor={ids.range}>
          <Select
            id={ids.range}
            value={range}
            onChange={(event) => changeRange(event.target.value as DateRange)}
          >
            {Object.entries(DATE_RANGES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          {range !== "all" && range !== "custom" && from && to ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatRange(from, to)}</p>
          ) : null}
        </Field>

        <Field label="Type" htmlFor={ids.type}>
          <Select
            id={ids.type}
            value={filters.type ?? ""}
            onChange={(event) => changeType(event.target.value)}
          >
            <option value="">All types</option>
            {(["INCOME", "EXPENSE"] as TransactionType[]).map((type) => (
              <option key={type} value={type}>
                {TRANSACTION_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Categories" htmlFor={ids.categories} className="col-span-2 sm:col-span-1">
          <MultiSelect
            id={ids.categories}
            options={categoryOptions}
            value={filters.categories}
            onChange={(selected) => setFilters({ categories: selected })}
            placeholder="All categories"
            emptyText="No categories"
          />
        </Field>

        <Field label="Sort by" htmlFor={ids.sort}>
          <Select
            id={ids.sort}
            value={filters.sort}
            onChange={(event) => setFilters({ sort: event.target.value as SortOption })}
          >
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        {range === "custom" ? (
          <>
            <Field label="From" htmlFor={ids.from}>
              <Input
                id={ids.from}
                type="date"
                value={from ?? ""}
                max={to ?? undefined}
                onChange={(event) => setFilters({ from: event.target.value || null })}
              />
            </Field>
            <Field label="To" htmlFor={ids.to}>
              <Input
                id={ids.to}
                type="date"
                value={to ?? ""}
                min={from ?? undefined}
                onChange={(event) => setFilters({ to: event.target.value || null })}
              />
            </Field>
          </>
        ) : null}

        <Field label="Min amount" htmlFor={ids.min}>
          <CurrencyInput
            id={ids.min}
            value={min}
            onValueChange={setMin}
            placeholder="Any"
            className="h-10 text-sm font-normal"
          />
        </Field>

        <Field label="Max amount" htmlFor={ids.max}>
          <CurrencyInput
            id={ids.max}
            value={max}
            onValueChange={setMax}
            placeholder="Any"
            className="h-10 text-sm font-normal"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs text-zinc-500 dark:text-zinc-400">
        {label}
      </Label>
      {children}
    </div>
  );
}
