import { Wallet } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/app"
      className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950">
        <Wallet className="size-4" aria-hidden />
      </span>
      Finance Manager
    </Link>
  );
}
