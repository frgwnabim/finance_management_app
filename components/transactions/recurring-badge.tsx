import { Repeat } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/** Marks a transaction created by a recurring item. Icon-only on small screens. */
export function RecurringBadge() {
  return (
    <Badge
      variant="info"
      className="shrink-0 gap-1 px-1.5 py-0.5 text-[11px] sm:py-0"
      title="Created by a recurring item"
    >
      <Repeat className="size-3" aria-hidden />
      <span className="sr-only sm:not-sr-only">Recurring</span>
    </Badge>
  );
}
