import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type LabelProps = ComponentProps<"label"> & {
  /** Render as a span when labelling a group (e.g. a radiogroup via aria-labelledby). */
  as?: "label" | "span";
};

export function Label({ as: Component = "label", className, ...props }: LabelProps) {
  return (
    <Component
      className={cn(
        "text-sm font-medium text-zinc-700 dark:text-zinc-300",
        className,
      )}
      {...props}
    />
  );
}
