"use client";

import Link from "next/link";
import { useOptimistic } from "react";

import { usePendingNavigation } from "@/components/ui/pending-navigation";
import { analyticsHref, PERIODS, type Period } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Scopes every chart and insight on the page. Plain links, enhanced to keep the frame. */
export function PeriodSelector({ period }: { period: Period }) {
  const { navigate } = usePendingNavigation();
  const [selected, setSelected] = useOptimistic(period);

  return (
    <nav aria-label="Period" className="mb-6">
      <ul className="inline-flex w-full rounded-lg border border-zinc-200 bg-white p-1 sm:w-auto dark:border-zinc-800 dark:bg-zinc-900">
        {(Object.keys(PERIODS) as Period[]).map((value) => {
          const isActive = value === selected;
          const href = analyticsHref(value);
          return (
            <li key={value} className="flex-1 sm:flex-none">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                  event.preventDefault();
                  navigate(href, () => setSelected(value));
                }}
                className={cn(
                  "block rounded-md px-3 py-1.5 text-center text-sm font-medium whitespace-nowrap transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-emerald-500",
                  isActive
                    ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                )}
              >
                <span className="sm:hidden">{PERIODS[value].shortLabel}</span>
                <span className="hidden sm:inline">{PERIODS[value].label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
