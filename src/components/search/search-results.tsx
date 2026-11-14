"use client";

import { CornerDownLeft } from "lucide-react";
import Link from "next/link";
import { TAG_SOLID } from "~/lib/tools/tag-styles";
import type { Tool } from "~/lib/tools/types";
import { cn } from "~/lib/utils";

interface SearchResultsProps {
  id: string;
  heading: string;
  tools: Tool[];
  /** The row the keyboard is on, or -1 when Enter would search instead. */
  active: number;
  query: string;
  total: number;
  onHover: (index: number) => void;
  onPick: (tool: Tool) => void;
}

export function optionId(id: string, index: number): string {
  return `${id}-option-${index}`;
}

/** The suggestions, shared by the search box and the command menu. */
export function SearchResults({
  id,
  heading,
  tools,
  active,
  query,
  total,
  onHover,
  onPick,
}: SearchResultsProps) {
  const more = total - tools.length;
  const searching = query.trim() !== "";

  return (
    <div className="flex flex-col">
      {tools.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          Nothing matches that yet.
        </p>
      ) : (
        <>
          <p className="px-5 pt-4 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {heading}
          </p>
          <div
            id={id}
            role="listbox"
            aria-label="Tool suggestions"
            className="flex flex-col px-2 pb-2"
          >
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              const current = index === active;
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  id={optionId(id, index)}
                  role="option"
                  aria-selected={current}
                  tabIndex={-1}
                  onPointerMove={() => onHover(index)}
                  onClick={() => onPick(tool)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                    current ? "bg-primary/15" : "hover:bg-primary/10",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      TAG_SOLID[tool.tags[0]],
                    )}
                  >
                    <Icon className="size-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold tracking-[-0.01em]">
                      {tool.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {tool.tagline}
                    </span>
                  </span>
                  {current && (
                    <CornerDownLeft
                      className="ml-auto size-4 shrink-0 text-muted-foreground"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}
      <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border px-5 py-3 text-xs text-muted-foreground">
        <span>
          {searching
            ? more > 0
              ? `Enter to see all ${total} matches`
              : "Enter to search"
            : "Type to search"}
        </span>
        <span className="font-mono">up and down to move</span>
      </p>
    </div>
  );
}
