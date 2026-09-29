"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
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
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      isLoading={isPending}
      aria-label="Log out"
      title="Log out"
    >
      {isPending ? null : <LogOut className="size-5" aria-hidden />}
    </Button>
  );
}
