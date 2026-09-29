import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { PAGE_SIZE, toQueryString, type TransactionFilters } from "@/lib/transaction-filters";
import { cn } from "@/lib/utils";

type TransactionPaginationProps = {
  filters: TransactionFilters;
  page: number;
  pageCount: number;
  total: number;
};

const linkClass =
  "inline-flex h-10 items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800";

export function TransactionPagination({
  filters,
  page,
  pageCount,
  total,
}: TransactionPaginationProps) {
  if (total === 0) return null;

  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);
  const hrefFor = (target: number) =>
    `/app/transactions${toQueryString({ ...filters, page: target })}`;

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{first}</span>
        {" to "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{last}</span> of{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{total}</span>
      </p>
      {pageCount > 1 ? (
        <div className="flex items-center gap-2">
          <PageLink href={hrefFor(page - 1)} disabled={page <= 1} label="Previous page">
            <ChevronLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">Previous</span>
          </PageLink>
          <span className="px-2 text-sm text-zinc-600 tabular-nums dark:text-zinc-300">
            Page {page} of {pageCount}
          </span>
          <PageLink href={hrefFor(page + 1)} disabled={page >= pageCount} label="Next page">
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" aria-hidden />
          </PageLink>
        </div>
      ) : null}
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={label} className={cn(linkClass, "pointer-events-none opacity-50")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={linkClass}>
      {children}
    </Link>
  );
}
