"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { focusSearchField } from "~/lib/search-field";

/**
 * On the home page the search field is already there, so this reaches for it
 * instead of navigating. Anywhere else it goes home, which lands in the field.
 */
export function SearchButton() {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Search tools"
        onClick={focusSearchField}
      >
        <Search strokeWidth={1.8} />
      </Button>
    );
  }

  return (
    <Button asChild variant="ghost" size="icon">
      <Link href="/" aria-label="Search tools">
        <Search strokeWidth={1.8} />
      </Link>
    </Button>
  );
}
