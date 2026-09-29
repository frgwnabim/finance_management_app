import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700",
        className,
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Icon className="size-6 text-zinc-500 dark:text-zinc-400" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
