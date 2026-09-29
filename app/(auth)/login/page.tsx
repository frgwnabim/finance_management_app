import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import { getSafeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl } = await searchParams;

  return (
    <Card>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Log in
      </h1>
      <p className="mt-1 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Welcome back. Enter your details to continue.
      </p>
      <LoginForm callbackUrl={getSafeRedirect(callbackUrl)} />
      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          Sign up
        </Link>
      </p>
    </Card>
  );
}
