"use client";

import { Toaster as Sonner } from "sonner";

import { useTheme } from "@/components/ui/use-theme";

/** Toast container. Mount once in the root layout; trigger with toast() from "@/components/ui/toast". */
export function Toaster() {
  const theme = useTheme() ?? "system";

  return <Sonner theme={theme} position="top-center" richColors closeButton />;
}
