import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",
        "dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
        className,
      )}
      {...props}
    />
  );
}
