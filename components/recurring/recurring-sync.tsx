"use client";

import { useEffect } from "react";

import { toast } from "@/components/ui/toast";
import { runRecurringForCurrentUser } from "@/lib/actions/recurring";
import { todayLocal } from "@/lib/dates";
import { pluralize } from "@/lib/utils";

// Started syncs in this page load, so React Strict Mode's double effect
// (and remounts) don't trigger a second call.
const started = new Set<string>();

/**
 * Generates due recurring transactions once per browser session (and per
 * day, for tabs left open overnight). The daily cron covers everyone else.
 */
export function RecurringSync({ userId }: { userId: string }) {
  useEffect(() => {
    const key = `recurring-sync:${userId}`;
    const today = todayLocal();
    try {
      if (sessionStorage.getItem(key) === today) return;
    } catch {
      // Storage unavailable: fall back to once per page load.
    }
    if (started.has(key)) return;
    started.add(key);

    runRecurringForCurrentUser()
      .then(({ created }) => {
        try {
          sessionStorage.setItem(key, today);
        } catch {}
        if (created > 0) {
          toast.success(`Added ${pluralize(created, "recurring transaction")}.`);
        }
      })
      .catch(() => {
        // Not critical: allow a retry on the next page load.
        started.delete(key);
      });
  }, [userId]);

  return null;
}
