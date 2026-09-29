"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  /** Options sharing a group are listed under a small heading. */
  group?: string;
};

type MultiSelectProps = {
  id?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  emptyText?: string;
  className?: string;
};

/** Dropdown with checkboxes. Closes on outside click or Escape. */
export function MultiSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  emptyText = "No options",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const selected = options.filter((option) => value.includes(option.value));
  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0].label
        : `${selected.length} selected`;

  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-left text-sm",
          "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none",
          "dark:border-zinc-700 dark:bg-zinc-900",
          selected.length === 0
            ? "text-zinc-500 dark:text-zinc-400"
            : "text-zinc-900 dark:text-zinc-100",
        )}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown className="size-4 shrink-0 text-zinc-500" aria-hidden />
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-1 w-full min-w-56 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {options.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-zinc-500">{emptyText}</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto p-1">
              {options.map((option, index) => (
                <li key={option.value}>
                  {option.group && option.group !== options[index - 1]?.group ? (
                    <p className="px-2 pt-2 pb-1 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                      {option.group}
                    </p>
                  ) : null}
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800">
                    <input
                      type="checkbox"
                      checked={value.includes(option.value)}
                      onChange={() => toggle(option.value)}
                      className="size-4 accent-emerald-600"
                    />
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
          {value.length > 0 ? (
            <div className="border-t border-zinc-200 p-1 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full rounded-md px-2 py-1.5 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Clear selection
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
