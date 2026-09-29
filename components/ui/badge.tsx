import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const variants = {
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  info: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
} as const;

type BadgeProps = ComponentProps<"span"> & {
  variant?: keyof typeof variants;
};

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
