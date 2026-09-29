"use client";

import { useEffect, useEffectEvent, useState } from "react";

/**
 * Local state for a text-like input whose value lives in the URL.
 * Typing updates the input immediately and commits to the URL after `delay` ms
 * of inactivity. If the URL changes from elsewhere (reset, back button), the
 * input follows it, without clobbering what the user is still typing.
 */
export function useDebouncedUrlState<T>(
  urlValue: T,
  commit: (value: T) => void,
  {
    delay = 300,
    isEqual = Object.is,
  }: { delay?: number; isEqual?: (a: T, b: T) => boolean } = {},
) {
  const [value, setValue] = useState(urlValue);
  const [prevUrlValue, setPrevUrlValue] = useState(urlValue);
  const [lastCommitted, setLastCommitted] = useState(urlValue);

  // Adjust state during render when the URL value changes (React docs pattern).
  if (!isEqual(urlValue, prevUrlValue)) {
    setPrevUrlValue(urlValue);
    if (!isEqual(urlValue, lastCommitted)) setValue(urlValue);
  }

  const onCommit = useEffectEvent((next: T) => {
    setLastCommitted(next);
    commit(next);
  });

  useEffect(() => {
    if (isEqual(value, urlValue)) return;
    const timer = setTimeout(() => onCommit(value), delay);
    return () => clearTimeout(timer);
  }, [value, urlValue, delay, isEqual]);

  return [value, setValue] as const;
}
