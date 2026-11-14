import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "~/components/brand-mark";
import { GithubIcon } from "~/components/icons/github";
import { SearchButton } from "~/components/layout/search-button";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { siteConfig } from "~/config/site";

interface HintProps {
  label: string;
  children: ReactNode;
}

function Hint({ label, children }: HintProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark className="size-6" />
          <span className="text-lg font-extrabold tracking-[-0.045em]">
            {siteConfig.name}
          </span>
        </Link>
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1">
            <Hint label="Search tools">
              <SearchButton />
            </Hint>
            <ThemeToggle />
            <Hint label="Source on GitHub">
              <Button asChild variant="ghost" size="icon">
                <a
                  href={siteConfig.links.github}
                  aria-label={`${siteConfig.name} on GitHub`}
                >
                  <GithubIcon className="size-[17px]" />
                </a>
              </Button>
            </Hint>
          </div>
        </TooltipProvider>
      </div>
    </header>
  );
}
