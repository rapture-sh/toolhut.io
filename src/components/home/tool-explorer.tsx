"use client";

import { ArrowDown, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { TagChip } from "~/components/tag-chip";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { tools } from "~/lib/tools/registry";
import { TAG_SOLID, TAG_STYLES } from "~/lib/tools/tag-styles";
import { TOOL_TAGS, type Tool } from "~/lib/tools/types";
import { cn } from "~/lib/utils";
import { filterTools, type TagFilter } from "~/utils/search";

/** Three rows of three. Everything past this is behind the fade. */
const PREVIEW = 9;
const FILTERS: TagFilter[] = ["all", ...TOOL_TAGS];
const FADE = "linear-gradient(to bottom, #000 72%, transparent 100%)";

interface ToolCardProps {
  tool: Tool;
}

function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;
  const planned = tool.status === "planned";

  const body = (
    <>
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105",
          TAG_SOLID[tool.tags[0]],
        )}
      >
        <Icon className="size-[22px]" strokeWidth={1.8} />
      </span>
      <span className="mt-5 flex items-center gap-2">
        <span className="text-[17px] font-semibold tracking-[-0.02em]">
          {tool.name}
        </span>
        {planned && (
          <span className="font-mono text-[11px] text-muted-foreground">
            soon
          </span>
        )}
      </span>
      <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {tool.description}
      </span>
      <span className="mt-auto flex flex-wrap gap-1.5 pt-6">
        {tool.tags.map((tag) => (
          <TagChip key={tag} tag={tag} />
        ))}
      </span>
    </>
  );

  const shared = "group flex h-full w-full flex-col rounded-3xl bg-card p-6";

  if (planned) {
    return <div className={cn(shared, "opacity-60")}>{body}</div>;
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(shared, "transition-colors hover:bg-accent")}
    >
      {body}
    </Link>
  );
}

export function ToolExplorer() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<TagFilter>("all");
  const [expanded, setExpanded] = useState(false);

  const matches = useMemo(
    () => filterTools(tools, { query, tag }),
    [query, tag],
  );

  const visible = expanded ? matches : matches.slice(0, PREVIEW);
  const hidden = matches.length - visible.length;

  return (
    <>
      <div className="mx-auto mt-14 max-w-2xl">
        <div className="relative">
          <label htmlFor="tool-search" className="sr-only">
            Search tools
          </label>
          <Search
            className="pointer-events-none absolute left-6 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={2}
            aria-hidden="true"
          />
          <Input
            id="tool-search"
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
            {visible.map((tool) => (
              <li key={tool.slug} className="flex">
                <ToolCard tool={tool} />
              </li>
            ))}
          </ul>
        )}
        {hidden > 0 && (
          <div className="-mt-2 flex justify-center">
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
