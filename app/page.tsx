import {
  ArrowRight,
  ChartPie,
  FileSpreadsheet,
  LayoutDashboard,
  Moon,
  PiggyBank,
  Repeat,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { TryDemoButton } from "@/components/demo/try-demo-button";
import { LandingHeader } from "@/components/landing/landing-header";
import { ScreenshotPlaceholder } from "@/components/landing/screenshot-placeholder";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Finance Manager: track every rupiah" },
  description:
    "A personal finance manager for income, expenses, budgets and recurring bills. Built with Next.js, Prisma and PostgreSQL.",
};

const HIGHLIGHTS = [
  {
    icon: LayoutDashboard,
    title: "See your month at a glance",
    description:
      "Balance, income and expenses with month-over-month change, a six-month spending chart, recent activity and the budgets closest to their limit.",
    screenshot: "Dashboard screenshot",
  },
  {
    icon: Search,
    title: "Find any transaction instantly",
    description:
      "Live search, date presets, category and amount filters, sorting and pagination. Every filter lives in the URL, so views survive refresh and can be shared.",
    screenshot: "Transactions screenshot",
  },
  {
    icon: ChartPie,
    title: "Understand where money goes",
    description:
      "Interactive charts for spending by category, trends, income vs expense and budget tracking, plus insights like savings rate and average daily spending.",
    screenshot: "Analytics screenshot",
  },
];

const MORE_FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: PiggyBank, title: "Monthly budgets", description: "Limits per category with clear warnings at 80% and 100%." },
  { icon: Repeat, title: "Recurring transactions", description: "Salary, rent and subscriptions recorded automatically." },
  { icon: FileSpreadsheet, title: "CSV import and export", description: "Bring in bank exports with column mapping and duplicate checks." },
  { icon: Moon, title: "Dark mode and mobile", description: "Light, dark or system theme, designed for phones first." },
];

const TECH_STACK = [
  { name: "Next.js 16", role: "App Router, Server Components, Server Actions" },
  { name: "TypeScript", role: "Strict mode end to end" },
  { name: "PostgreSQL on Neon", role: "Serverless Postgres" },
  { name: "Prisma 7", role: "ORM, migrations, typed queries" },
  { name: "Auth.js", role: "Credentials sign-in with JWT sessions" },
  { name: "Tailwind CSS 4", role: "Design system with dark mode" },
  { name: "Recharts", role: "Interactive, accessible charts" },
  { name: "Zod", role: "Server-side validation for every input" },
  { name: "Vercel", role: "Hosting and daily cron jobs" },
];

const ENGINEERING = [
  "Money stored as integer rupiah, never floats",
  "Every query scoped to the signed-in user",
  "Aggregations run in the database with GROUP BY",
  "Idempotent recurring generation, safe under concurrent runs",
  "All-or-nothing CSV import in a single transaction",
  "Accessible charts with table views and validated color palettes",
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const isSignedIn = user !== null;

  return (
    <div className="flex min-h-dvh flex-col bg-white dark:bg-zinc-950">
      <LandingHeader isSignedIn={isSignedIn} />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-2 lg:pt-24">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              Personal finance, in Rupiah
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              Know where every rupiah goes.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
              Track income and expenses, set monthly budgets, automate recurring bills and see
              clear analytics. Fast on your phone, comfortable on desktop.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isSignedIn ? (
                <Link
                  href="/app"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-base font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                >
                  Open dashboard
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <>
                  <TryDemoButton />
                  <Link
                    href="/register"
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-base font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            {isSignedIn ? null : (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                The demo needs no sign-up and comes with six months of sample data. It resets daily.
              </p>
            )}
          </div>
          <ScreenshotPlaceholder label="Dashboard screenshot" />
        </section>

        {/* Feature highlights */}
        <section aria-labelledby="features-heading" className="border-t border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Everything you need to manage your money
            </h2>
            <div className="mt-12 flex flex-col gap-16">
              {HIGHLIGHTS.map((feature, index) => (
                <div key={feature.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                  <div className={cn(index % 2 === 1 && "lg:order-2")}>
                    <FeatureIcon icon={feature.icon} />
                    <h3 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
                    <p className="mt-3 text-zinc-600 dark:text-zinc-400">{feature.description}</p>
                  </div>
                  <ScreenshotPlaceholder label={feature.screenshot} />
                </div>
              ))}
            </div>

            <ul className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {MORE_FEATURES.map((feature) => (
                <li key={feature.title} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <FeatureIcon icon={feature.icon} />
                  <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tech stack */}
        <section aria-labelledby="stack-heading" className="py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[3fr_2fr]">
            <div>
              <h2 id="stack-heading" className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Built with a modern stack
              </h2>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {TECH_STACK.map((tech) => (
                  <li key={tech.name} className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">{tech.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{tech.role}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                Under the hood
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {ENGINEERING.map((item) => (
                  <li key={item} className="flex gap-3 text-zinc-600 dark:text-zinc-400">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        {isSignedIn ? null : (
          <section className="border-t border-zinc-200 py-16 dark:border-zinc-800">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">See it with real-looking data</h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <TryDemoButton />
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-base font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <p className="mx-auto max-w-6xl px-4 text-sm text-zinc-500 sm:px-6 dark:text-zinc-400">
          Finance Manager, a portfolio project. Amounts in Indonesian Rupiah.
        </p>
      </footer>
    </div>
  );
}

function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
      <Icon className="size-5" aria-hidden />
    </span>
  );
}
