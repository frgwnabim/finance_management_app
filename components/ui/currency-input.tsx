"use client";

import type { ComponentProps, KeyboardEvent } from "react";

import { formatNumber } from "@/lib/money";
import { cn } from "@/lib/utils";

const MAX_DIGITS = 12;

type CurrencyInputProps = Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  /** Integer rupiah, or null when empty. */
  value: number | null;
  onValueChange: (value: number | null) => void;
};

/** Index in `formatted` just after the n-th digit. */
function caretAfterDigits(formatted: string, digitCount: number) {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < formatted.length; index++) {
    if (/\d/.test(formatted[index])) {
      seen++;
      if (seen === digitCount) return index + 1;
    }
  }
  return formatted.length;
}

/**
 * Rupiah amount input. Shows "1.250.000" while typing and reports an integer.
 * The DOM value and caret are updated directly in the change handler so the
 * caret doesn't jump to the end when separators are added or removed.
 */
export function CurrencyInput({
  value,
  onValueChange,
  className,
  onKeyDown,
  ...props
}: CurrencyInputProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const caret = input.selectionStart ?? input.value.length;
    const allDigits = input.value.replace(/\D/g, "");
    const digitsBeforeCaret = input.value.slice(0, caret).replace(/\D/g, "").length;
    const withoutLeadingZeros = allDigits.replace(/^0+/, "");
    const removedZeros = allDigits.length - withoutLeadingZeros.length;
    const digits = withoutLeadingZeros.slice(0, MAX_DIGITS);

    const next = digits ? Number(digits) : null;
    const formatted = next === null ? "" : formatNumber(next);
    input.value = formatted;
    const position = caretAfterDigits(formatted, digitsBeforeCaret - removedZeros);
    input.setSelectionRange(position, position);
    onValueChange(next);
  }

  // Make Backspace/Delete next to a separator remove the digit instead of the dot.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    const input = event.currentTarget;
    const { selectionStart: start, selectionEnd: end } = input;
    if (start === null || start !== end) return;
    if (event.key === "Backspace" && input.value[start - 1] === ".") {
      input.setSelectionRange(start - 1, start - 1);
    } else if (event.key === "Delete" && input.value[start] === ".") {
      input.setSelectionRange(start + 1, start + 1);
    }
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value === null ? "" : formatNumber(value)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-12 w-full rounded-lg border border-zinc-300 bg-white pr-3 pl-10 text-lg font-semibold text-zinc-900 tabular-nums placeholder:text-zinc-400",
          "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none",
          "aria-invalid:border-red-500",
          "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
          className,
        )}
        {...props}
      />
    </div>
  );
}
