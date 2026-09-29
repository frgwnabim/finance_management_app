import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SectionHeaderProps = {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
};

/** Card header with an optional "View all" style link on the right. */
export function SectionHeader({ title, description, href, linkLabel }: SectionHeaderProps) {
  return (
    <CardHeader className="flex-row items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          {linkLabel}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </CardHeader>
  );
}
