import { redirect } from "next/navigation";

import { auth } from "@/auth";

/** Current user from the session, or null. Works in Server Components and Server Actions. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user?.id ? session.user : null;
}

/** Current user, or redirect to /login. Use to scope every query by user.id. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
