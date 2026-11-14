"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, VisuallyHidden } from "radix-ui";
import { useCallback, useEffect, useId } from "react";
import { optionId, SearchResults } from "~/components/search/search-results";
import { useToolSearch } from "~/components/search/use-tool-search";
import type { Tool } from "~/lib/tools/types";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** The command menu every page but the home page opens. */
export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const listId = useId();

  const select = useCallback(
    (tool: Tool) => {
      onOpenChange(false);
      router.push(`/tools/${tool.slug}`);
    },
    [onOpenChange, router],
  );

  const submit = useCallback(
    (query: string) => {
      onOpenChange(false);
      router.push(`/?q=${encodeURIComponent(query)}`);
    },
    [onOpenChange, router],
  );

  const search = useToolSearch({ onSelect: select, onSubmit: submit });
  const { setQuery } = search;

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open, setQuery]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="anim-tooltip fixed left-1/2 top-[14vh] z-50 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-3xl bg-card outline-none"
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Search tools</Dialog.Title>
          </VisuallyHidden.Root>
          <div className="flex items-center gap-3 border-b border-border px-5">
            <Search
              className="size-[18px] shrink-0 text-muted-foreground"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              type="search"
              role="combobox"
              value={search.query}
              onChange={(event) => search.setQuery(event.target.value)}
              onKeyDown={search.onKeyDown}
              placeholder="Search tools"
              aria-label="Search tools"
              aria-controls={listId}
              aria-expanded
              aria-autocomplete="list"
              aria-activedescendant={
                search.active >= 0 ? optionId(listId, search.active) : undefined
              }
              autoComplete="off"
              className="h-14 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
          </div>
          <SearchResults
            id={listId}
            heading={search.heading}
            tools={search.suggestions}
            active={search.active}
            query={search.query}
            total={search.total}
            onHover={search.setActive}
            onPick={() => onOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
