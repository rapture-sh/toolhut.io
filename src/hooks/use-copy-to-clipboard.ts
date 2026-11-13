"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copies a string to the clipboard and reports success for a short while, so a
 * button can say "Copied" and then go back to "Copy".
 */
export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (value: string) => {
      if (value === "") {
        return false;
      }

      try {
        await navigator.clipboard.writeText(value);
      } catch {
        return false;
      }

      setCopied(true);

      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => setCopied(false), resetAfterMs);

      return true;
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
