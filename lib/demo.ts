// Demo account: a realistic, reproducible 6-month history that the seed
// script, the "Reset demo data" button and the daily cron all rebuild.

import { randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";

import { getMonthRange, parseDateOnly, shiftMonth, todayInAppTimeZone, toMonthKey } from "@/lib/dates";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";
import type { Frequency, TransactionType } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { addDays, getDueDates } from "@/lib/recurring-schedule";

export const DEMO_EMAIL = "demo@finance-manager.app";
export const DEMO_NAME = "Demo User";

const MONTHS_OF_HISTORY = 6;

export function isDemoUser(user: { email?: string | null }) {
  return user.email === DEMO_EMAIL;
}

/** Small deterministic PRNG (mulberry32), so every reset produces the same data. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    chance: (probability: number) => next() < probability,
    /** Random amount between min and max, rounded to `step` rupiah. */
    amount: (min: number, max: number, step = 1000) =>
      Math.round((min + next() * (max - min)) / step) * step,
    pick: <T>(items: readonly T[]) => items[Math.floor(next() * items.length)],
  };
}

type DemoTransaction = {
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  note: string;
  recurring?: string;
};

type DemoRecurring = {
  key: string;
  category: string;
  type: TransactionType;
  amount: number;
  note: string;
  frequency: Frequency;
  day: number;
};

const RECURRING: DemoRecurring[] = [
  { key: "salary", category: "Salary", type: "INCOME", amount: 12_500_000, note: "Monthly salary", frequency: "MONTHLY", day: 25 },
  { key: "rent", category: "Bills", type: "EXPENSE", amount: 3_500_000, note: "Apartment rent", frequency: "MONTHLY", day: 1 },
  { key: "netflix", category: "Entertainment", type: "EXPENSE", amount: 186_000, note: "Netflix subscription", frequency: "MONTHLY", day: 15 },
];

const MEALS = ["Nasi padang", "Warteg lunch", "Bakso", "Soto ayam", "GoFood dinner", "Nasi goreng", "Mie ayam", "Sushi with friends", "Ayam geprek"];
const COFFEE = ["Kopi susu", "Coffee at Kopi Kenangan", "Iced latte"];
const RIDES = ["Gojek", "Grab", "KRL", "TransJakarta", "Gojek to office"];
const SHOPPING = ["Tokopedia order", "Shopee checkout", "Uniqlo", "New headphones", "Household supplies", "Running shoes"];
const FUN = ["Cinema XXI", "Karaoke night", "Bowling", "Board game cafe", "Concert tickets"];

/** Every demo transaction from `start` to `today` (inclusive), oldest first. */
function buildTransactions(start: string, today: string): DemoTransaction[] {
  const random = createRandom(20260929);
  const rows: DemoTransaction[] = [];
  const add = (row: DemoTransaction) => rows.push(row);

  for (let date = start; date <= today; date = addDays(date, 1)) {
    const day = Number(date.slice(8, 10));
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;

    // Food: lunch most days, dinner often, coffee on some mornings.
    if (random.chance(0.9)) add({ category: "Food", type: "EXPENSE", amount: random.amount(18_000, 45_000, 500), date, note: random.pick(MEALS) });
    if (random.chance(0.55)) add({ category: "Food", type: "EXPENSE", amount: random.amount(25_000, 85_000, 500), date, note: random.pick(MEALS) });
    if (random.chance(0.35)) add({ category: "Food", type: "EXPENSE", amount: random.amount(18_000, 38_000, 500), date, note: random.pick(COFFEE) });
    if (day === 2 || day === 16) add({ category: "Food", type: "EXPENSE", amount: random.amount(650_000, 950_000), date, note: "Groceries at supermarket" });

    // Transport: commuting on weekdays, fuel once a week.
    if (!isWeekend && random.chance(0.8)) add({ category: "Transport", type: "EXPENSE", amount: random.amount(12_000, 45_000, 500), date, note: random.pick(RIDES) });
    if (weekday === 6) add({ category: "Transport", type: "EXPENSE", amount: random.amount(120_000, 180_000), date, note: "Fuel" });

    // Bills besides rent (rent is a recurring item).
    if (day === 3) add({ category: "Bills", type: "EXPENSE", amount: random.amount(320_000, 480_000), date, note: "Electricity token" });
    if (day === 10) add({ category: "Bills", type: "EXPENSE", amount: 150_000, date, note: "Phone and data plan" });
    if (day === 12) add({ category: "Bills", type: "EXPENSE", amount: 385_000, date, note: "Home internet" });

    // Occasional spending.
    if (random.chance(0.1)) add({ category: "Shopping", type: "EXPENSE", amount: random.amount(120_000, 950_000), date, note: random.pick(SHOPPING) });
    if (isWeekend && random.chance(0.35)) add({ category: "Entertainment", type: "EXPENSE", amount: random.amount(60_000, 350_000), date, note: random.pick(FUN) });
    if (random.chance(0.04)) add({ category: "Health", type: "EXPENSE", amount: random.amount(45_000, 400_000), date, note: random.pick(["Pharmacy", "Vitamins", "Doctor visit"]) });
    if (day === 7) add({ category: "Education", type: "EXPENSE", amount: random.amount(150_000, 450_000), date, note: random.pick(["Online course", "Books", "English class"]) });

    // Extra income now and then.
    if (random.chance(0.03)) add({ category: "Freelance", type: "INCOME", amount: random.amount(1_500_000, 4_500_000, 50_000), date, note: "Freelance design project" });
    if (random.chance(0.01)) add({ category: "Gift", type: "INCOME", amount: random.amount(200_000, 1_000_000, 50_000), date, note: "Gift from family" });
  }

  return rows;
}

/**
 * Creates the demo user if needed and replaces all of its data with a fresh
 * 6-month history ending today. The user row (and id) is kept so visitors
 * who are signed in stay signed in. Runs in one database transaction.
 */
export async function resetDemoData(today = todayInAppTimeZone()) {
  const currentMonth = toMonthKey(today);
  const start = getMonthRange(shiftMonth(currentMonth, -(MONTHS_OF_HISTORY - 1))).from;

  // Nobody can sign in with a password; "Try Demo" uses its own provider.
  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);

  return prisma.$transaction(
    async (tx) => {
      const user = await tx.user.upsert({
        where: { email: DEMO_EMAIL },
        create: { email: DEMO_EMAIL, name: DEMO_NAME, passwordHash },
        update: { name: DEMO_NAME },
        select: { id: true },
      });
      const userId = user.id;

      // Order matters: transactions reference categories and recurring items.
      await tx.transaction.deleteMany({ where: { userId } });
      await tx.recurringTransaction.deleteMany({ where: { userId } });
      await tx.budget.deleteMany({ where: { userId } });
      await tx.category.deleteMany({ where: { userId } });

      await tx.category.createMany({ data: DEFAULT_CATEGORIES.map((category) => ({ ...category, userId })) });
      const categories = await tx.category.findMany({ where: { userId }, select: { id: true, name: true, type: true } });
      const categoryId = (name: string, type: TransactionType) =>
        categories.find((category) => category.name === name && category.type === type)!.id;

      // Recurring items, with the transactions they would have generated.
      const recurringRows: DemoTransaction[] = [];
      for (const item of RECURRING) {
        const startDate = `${start.slice(0, 8)}${String(item.day).padStart(2, "0")}`;
        const dates = getDueDates({ frequency: item.frequency, startDate, endDate: null }, null, today);
        const created = await tx.recurringTransaction.create({
          data: {
            userId,
            categoryId: categoryId(item.category, item.type),
            type: item.type,
            amount: item.amount,
            note: item.note,
            frequency: item.frequency,
            startDate: parseDateOnly(startDate),
            lastGeneratedDate: dates.length > 0 ? parseDateOnly(dates[dates.length - 1]) : null,
            isActive: true,
          },
          select: { id: true },
        });
        for (const date of dates) {
          recurringRows.push({ category: item.category, type: item.type, amount: item.amount, date, note: item.note, recurring: created.id });
        }
      }

      const rows = [...buildTransactions(start, today), ...recurringRows];
      await tx.transaction.createMany({
        data: rows.map((row) => ({
          userId,
          categoryId: categoryId(row.category, row.type),
          type: row.type,
          amount: row.amount,
          date: parseDateOnly(row.date),
          note: row.note,
          recurringId: row.recurring ?? null,
        })),
      });

      // Budgets for the current month; a couple end up close to or over the limit.
      const budgets: [string, number][] = [
        ["Food", 4_000_000],
        ["Transport", 900_000],
        ["Bills", 5_000_000],
        ["Shopping", 1_500_000],
        ["Entertainment", 800_000],
        ["Health", 300_000],
      ];
      await tx.budget.createMany({
        data: budgets.map(([name, amount]) => ({
          userId,
          categoryId: categoryId(name, "EXPENSE"),
          month: currentMonth,
          amount,
        })),
      });

      return { userId, transactions: rows.length };
    },
    { timeout: 60_000 },
  );
}
