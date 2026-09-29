"use server";

import { signIn } from "@/auth";
import type { ActionResult } from "@/lib/actions/result";
import { revalidateApp } from "@/lib/actions/revalidate";
import { DEMO_EMAIL, isDemoUser, resetDemoData } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

/** "Try Demo": signs into the demo account, seeding it first if it doesn't exist. */
export async function loginAsDemo(): Promise<ActionResult> {
  try {
    const exists = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
      select: { id: true },
    });
    if (!exists) await resetDemoData();

    await signIn("demo", { redirect: false });
    return { ok: true, message: "Welcome to the demo!" };
  } catch (error) {
    console.error("Demo sign-in failed", error);
    return { ok: false, message: "Couldn't open the demo. Please try again." };
  }
}

/** Restores the demo account's data. Only available to the demo user. */
export async function resetDemoDataAction(): Promise<ActionResult> {
  const user = await requireUser();
  if (!isDemoUser(user)) return { ok: false, message: "Only the demo account can be reset." };

  await resetDemoData();
  revalidateApp();
  return { ok: true, message: "Demo data has been reset." };
}
