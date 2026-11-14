"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchDialog } from "~/components/search/search-dialog";
import { Button } from "~/components/ui/button";
import { focusSearchField } from "~/lib/search-field";

/**
 * On the home page the search field is already there, so this reaches for it.
 * Anywhere else it opens the command menu, as does the usual keyboard
 * shortcut, which people try on a site like this before anything else.
 */
export function SearchButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const home = pathname === "/";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) {
        return;
      }

      event.preventDefault();

      if (home) {
        focusSearchField();
        return;
      }

      setOpen((showing) => !showing);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [home]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Search tools"
        onClick={() => (home ? focusSearchField() : setOpen(true))}
      >
        <Search strokeWidth={1.8} />
      </Button>
      {!home && <SearchDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
