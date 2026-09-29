import { Wallet } from "lucide-react";
import Link from "next/link";

export function Logo({ href = "/app" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-2 font-semibold whitespace-nowrap text-zinc-900 dark:text-zinc-50"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950">
        <Wallet className="size-4" aria-hidden />
      </span>
      Finance Manager
    </Link>
  );
}
