"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await logoutAction();
        toast.success("You have been logged out.");
        router.replace("/login");
        router.refresh();
      } catch {
        toast.error("Could not log out. Please try again.");
      }
    });
  }

  return (
    <Button variant="secondary" onClick={handleLogout} disabled={isPending}>
      {isPending ? "Logging out..." : "Log out"}
    </Button>
  );
}
