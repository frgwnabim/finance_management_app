"use client";

import { useSyncExternalStore } from "react";

import { getTheme, subscribeTheme, type Theme } from "@/lib/theme";

/** Stored theme preference. null during SSR and hydration (unknown on the server). */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribeTheme, getTheme, () => null);
}
