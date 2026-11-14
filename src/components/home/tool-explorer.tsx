"use client";

import { ArrowDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ToolCard } from "~/components/tools/tool-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { SEARCH_FIELD_ID, shouldFocusOnLoad } from "~/lib/search-field";
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
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<TagFilter>("all");
  const [expanded, setExpanded] = useState(false);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shouldFocusOnLoad()) {
      field.current?.focus({ preventScroll: true });
    }
  }, []);

  const matches = useMemo(
    () => filterTools(allTools(), { query, tag }),
    [query, tag],
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
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setExpanded(false);
            }}
            placeholder="Search tools"
            autoComplete="off"
            className="h-16 rounded-full bg-card pl-14 pr-6 text-lg"
          />
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
