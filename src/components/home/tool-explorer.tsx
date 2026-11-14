"use client";

import { ArrowDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { optionId, SearchResults } from "~/components/search/search-results";
import { useToolSearch } from "~/components/search/use-tool-search";
import { ToolCard } from "~/components/tools/tool-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  SEARCH_FIELD_ID,
  SEARCH_FOCUS_EVENT,
  shouldFocusOnLoad,
} from "~/lib/search-field";
import { allTools } from "~/lib/tools/registry";
import { TAG_SOLID, TAG_STYLES } from "~/lib/tools/tag-styles";
import { TOOL_TAGS } from "~/lib/tools/types";
import { cn } from "~/lib/utils";
import { filterTools, type TagFilter } from "~/utils/search";

/** Three rows of three on a laptop, one short list on a phone. */
const PREVIEW = 9;
const MOBILE_PREVIEW = 3;
const FILTERS: TagFilter[] = ["all", ...TOOL_TAGS];
const FADE = "linear-gradient(to bottom, #000 72%, transparent 100%)";

export function ToolExplorer() {
  const router = useRouter();
  const [tag, setTag] = useState<TagFilter>("all");
  const [applied, setApplied] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();

  const search = useToolSearch({
    onSelect: (tool) => {
      setOpen(false);
      router.push(`/tools/${tool.slug}`);
    },
    onSubmit: (value) => {
      setOpen(false);
      setExpanded(false);
      setApplied(value);
      // Enter is what commits a search, so the address can carry it and the
      // result stays a link somebody can send on.
      window.history.pushState(
        null,
        "",
        value === "" ? "/" : `/?q=${encodeURIComponent(value)}`,
      );
    },
    onEscape: () => setOpen(false),
  });
  const { query, setQuery } = search;

  useEffect(() => {
    // Arriving with a search already in the address means the answer is on
    // screen, so the list would only cover it up.
    const asked = new URLSearchParams(window.location.search).get("q");

    if (!asked && shouldFocusOnLoad()) {
      field.current?.focus({ preventScroll: true });
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    function onRequest() {
      field.current?.focus({ preventScroll: true });
      setOpen(true);
    }

    window.addEventListener(SEARCH_FOCUS_EVENT, onRequest);

    return () => window.removeEventListener(SEARCH_FOCUS_EVENT, onRequest);
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!box.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);

    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const read = () => {
      const asked = new URLSearchParams(window.location.search).get("q") ?? "";
      setQuery(asked);
      setApplied(asked);
    };

    read();
    window.addEventListener("popstate", read);

    return () => window.removeEventListener("popstate", read);
  }, [setQuery]);

  const matches = useMemo(
    () => filterTools(allTools(), { query: applied, tag }),
    [applied, tag],
  );

  const visible = expanded ? matches : matches.slice(0, PREVIEW);
  const hidden = matches.length - visible.length;
  // A phone shows three before the fade, a laptop shows three rows of three.
  const hiddenOnPhone = expanded
    ? 0
    : Math.max(0, matches.length - MOBILE_PREVIEW);

  return (
    <>
      <div className="mx-auto mt-14 max-w-2xl">
        <div ref={box} className="relative">
          <div className="relative">
            <label htmlFor={SEARCH_FIELD_ID} className="sr-only">
              Search tools
            </label>
            <Search
              className="pointer-events-none absolute left-6 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              strokeWidth={2}
              aria-hidden="true"
            />
            <Input
              ref={field}
              id={SEARCH_FIELD_ID}
              type="search"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                search.active >= 0 ? optionId(listId, search.active) : undefined
              }
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setExpanded(false);
                setOpen(true);
              }}
              onKeyDown={search.onKeyDown}
              onFocus={() => setOpen(true)}
              placeholder="Search tools"
              autoComplete="off"
              className="h-16 rounded-full bg-card pl-14 pr-6 text-lg"
            />
          </div>
          {open && (
            <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-3xl bg-popover text-left shadow-2xl ring-1 ring-border">
              <SearchResults
                id={listId}
                heading={search.heading}
                tools={search.suggestions}
                active={search.active}
                query={query}
                total={search.total}
                onHover={search.setActive}
                onPick={() => setOpen(false)}
              />
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {FILTERS.map((filter) => {
            const active = filter === tag;
            const look =
              filter === "all"
                ? active
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-accent"
                : active
                  ? TAG_SOLID[filter]
                  : TAG_STYLES[filter];
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setTag(filter);
                  setExpanded(false);
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-all hover:opacity-85 active:scale-[0.97]",
                  look,
                )}
              >
                {filter === "all" ? "All tools" : `#${filter}`}
              </button>
            );
          })}
        </div>
      </div>
      <div id="tools" className="mt-20 scroll-mt-24">
        {matches.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            Nothing matches that yet.
          </p>
        ) : (
          <ul
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            style={
              hidden > 0
                ? { maskImage: FADE, WebkitMaskImage: FADE }
                : undefined
            }
          >
            {visible.map((tool, index) => (
              <li
                key={tool.slug}
                className={cn(
                  "flex",
                  !expanded && index >= MOBILE_PREVIEW && "hidden sm:flex",
                )}
              >
                <ToolCard tool={tool} />
              </li>
            ))}
          </ul>
        )}
        {hiddenOnPhone > 0 && (
          <div
            className={cn(
              "-mt-2 flex justify-center",
              hidden === 0 && "sm:hidden",
            )}
          >
            <Button type="button" size="lg" onClick={() => setExpanded(true)}>
              Show all {matches.length} tools
              <ArrowDown className="transition-transform duration-200 group-hover:translate-y-0.5" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
