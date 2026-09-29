import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Native select, styled to match Input. Pass <option> elements as children. */
export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-zinc-300 bg-white pr-9 pl-3 text-sm text-zinc-900",
          "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none",
          "disabled:opacity-60 aria-invalid:border-red-500",
          "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
          className,
        )}
        {...props}
      />
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-zinc-500"
        aria-hidden
      />
    </div>
  );
}
