"use client";

import { type KeyboardEvent, useCallback, useMemo, useState } from "react";
import { allTools, popularTools } from "~/lib/tools/registry";
import type { Tool } from "~/lib/tools/types";
import { searchTools } from "~/utils/search";

/** Enough to pick from without the box becoming a second page. */
export const SUGGESTION_LIMIT = 3;

interface ToolSearchOptions {
  /** A tool was chosen, by click or by Enter on a highlighted row. */
  onSelect: (tool: Tool) => void;
  /** Enter with nothing highlighted: search for the words themselves. */
  onSubmit: (query: string) => void;
  onEscape?: () => void;
}

export interface ToolSearch {
  query: string;
  setQuery: (value: string) => void;
  heading: string;
  suggestions: Tool[];
  /** How many tools match in all, which is more than are shown. */
  total: number;
  /** The row the keyboard is on, or -1 when Enter would search instead. */
  active: number;
  setActive: (index: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  select: (tool: Tool) => void;
}

/**
 * The shared behaviour of the search box and the command menu: what to offer,
 * which row the arrow keys are on, and what Enter means.
 */
export function useToolSearch({
  onSelect,
  onSubmit,
  onEscape,
}: ToolSearchOptions): ToolSearch {
  const [query, setStoredQuery] = useState("");
  const [active, setActive] = useState(-1);

  const { heading, suggestions, total } = useMemo(() => {
    const needle = query.trim();

    if (needle === "") {
      const popular = popularTools(SUGGESTION_LIMIT);
      return {
        heading: "Popular",
        suggestions: popular,
        total: popular.length,
      };
    }

    const found = searchTools(allTools(), needle).filter(
      (tool) => tool.status === "ready",
    );

    return {
      heading: "Tools",
      suggestions: found.slice(0, SUGGESTION_LIMIT),
      total: found.length,
    };
  }, [query]);

  // Typing moves the goalposts, so the keyboard starts again from the field.
  const setQuery = useCallback((value: string) => {
    setStoredQuery(value);
    setActive(-1);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive(active < suggestions.length - 1 ? active + 1 : -1);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive(active > -1 ? active - 1 : suggestions.length - 1);
        return;
      }

      if (event.key === "Enter") {
        const picked = suggestions[active];

        if (picked) {
          event.preventDefault();
          onSelect(picked);
          return;
        }

        if (query.trim() !== "") {
          event.preventDefault();
          onSubmit(query.trim());
        }
        return;
      }

      if (event.key === "Escape") {
        onEscape?.();
      }
    },
    [active, suggestions, query, onSelect, onSubmit, onEscape],
  );

  return {
    query,
    setQuery,
    heading,
    suggestions,
    total,
    active,
    setActive,
    onKeyDown,
    select: onSelect,
  };
}
