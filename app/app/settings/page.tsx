import { ChevronRight, Tags } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };

const SECTIONS = [
  {
    href: "/app/settings/categories",
    title: "Categories",
    description: "Manage income and expense categories, colors and icons.",
    icon: Tags,
  },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your account and categories." />
      <Card className="p-0 sm:p-0">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {SECTIONS.map(({ href, title, description, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-zinc-50 sm:px-6 dark:hover:bg-zinc-800/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-zinc-900 dark:text-zinc-50">
                    {title}
                  </span>
                  <span className="block text-sm text-zinc-500 dark:text-zinc-400">
                    {description}
                  </span>
                </span>
                <ChevronRight className="size-5 text-zinc-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
