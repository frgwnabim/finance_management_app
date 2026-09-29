"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import type { AuthFormState } from "@/lib/actions/auth";

type AuthAction = (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;

/** Runs an auth Server Action, toasts the result and navigates on success. */
export function useAuthForm(action: AuthAction, successMessage: string) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
  });

  useEffect(() => {
    if (state.status === "success") {
      toast.success(successMessage);
      router.replace(state.redirectTo);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, successMessage, router]);

  return { state, formAction, isPending };
}
