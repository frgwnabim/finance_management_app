"use client";

import { useAuthForm } from "@/components/auth/use-auth-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { registerAction } from "@/lib/actions/auth";

export function RegisterForm() {
  const { state, formAction, isPending } = useAuthForm(
    registerAction,
    "Account created. Welcome!",
  );
  const error = state.status === "error" ? state : null;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {error && !error.fieldErrors ? <Alert>{error.message}</Alert> : null}
      <FormField
        id="name"
        name="name"
        label="Name"
        autoComplete="name"
        required
        defaultValue={error?.values?.name}
        errors={error?.fieldErrors?.name}
      />
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
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        errors={error?.fieldErrors?.password}
      />
      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
