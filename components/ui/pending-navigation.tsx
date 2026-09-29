"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useTransition, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type PendingNavigationValue = {
  isPending: boolean;
  /** `onStart` runs inside the transition, e.g. to set optimistic state. */
  navigate: (href: string, onStart?: () => void) => void;
};

const PendingNavigationContext = createContext<PendingNavigationValue | null>(null);

/**
 * Navigates inside a transition so the current content stays on screen
 * (dimmed by PendingRegion) while the next page loads, instead of flashing
 * a skeleton.
 */
export function PendingNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigate = (href: string, onStart?: () => void) =>
    startTransition(() => {
      onStart?.();
      router.push(href, { scroll: false });
    });

  return (
    <PendingNavigationContext value={{ isPending, navigate }}>
      {children}
    </PendingNavigationContext>
  );
}

export function usePendingNavigation() {
  const context = use(PendingNavigationContext);
  if (!context) {
    throw new Error("usePendingNavigation must be used inside PendingNavigationProvider");
  }
  return context;
}

export function PendingRegion({ children, className }: { children: ReactNode; className?: string }) {
  const { isPending } = usePendingNavigation();
  return (
    <div aria-busy={isPending} className={cn("transition-opacity", isPending && "opacity-60", className)}>
      {children}
    </div>
  );
}
