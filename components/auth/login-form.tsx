"use client";

import { useAuthForm } from "@/components/auth/use-auth-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const { state, formAction, isPending } = useAuthForm(loginAction, "Welcome back!");
  const error = state.status === "error" ? state : null;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      {error && !error.fieldErrors ? <Alert>{error.message}</Alert> : null}
      <FormField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        defaultValue={error?.values?.email}
        errors={error?.fieldErrors?.email}
      />
      <FormField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        errors={error?.fieldErrors?.password}
      />
      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
