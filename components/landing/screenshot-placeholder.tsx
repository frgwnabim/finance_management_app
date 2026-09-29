import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type ScreenshotPlaceholderProps = {
  label: string;
  /** Path under /public, e.g. "/screenshots/dashboard.png". Omit to show a placeholder. */
  src?: string;
  className?: string;
};

/**
 * Browser-window frame for a product screenshot. Until a real image is
 * added (pass `src`), it shows a labelled placeholder.
 */
export function ScreenshotPlaceholder({ label, src, className }: ScreenshotPlaceholderProps) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800" aria-hidden>
        <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
      </div>
      <div className="relative aspect-[16/10]">
        {src ? (
          <Image src={src} alt={label} fill className="object-cover object-top" sizes="(min-width: 1024px) 50vw, 100vw" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-center dark:from-emerald-500/10 dark:via-zinc-900 dark:to-sky-500/10">
            <ImageIcon className="size-8 text-zinc-400" aria-hidden />
            <figcaption className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</figcaption>
          </div>
        )}
      </div>
    </figure>
  );
}
