"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { loginAsDemo } from "@/lib/actions/demo";
import { cn } from "@/lib/utils";

/** Signs straight into the demo account, no credentials needed. */
export function TryDemoButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await loginAsDemo();
      if (result.ok) {
        toast.success(result.message);
        router.push("/app");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button onClick={handleClick} isLoading={isPending} className={cn("h-12 px-6 text-base", className)}>
      Try Demo
      {isPending ? null : <ArrowRight className="size-4" aria-hidden />}
    </Button>
  );
}
