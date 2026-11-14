import { BrandMark } from "~/components/brand-mark";
import { GithubIcon } from "~/components/icons/github";
import { RaptureWordmark } from "~/components/icons/rapture-wordmark";
import { siteConfig } from "~/config/site";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-6">
        <span className="flex items-center gap-2.5">
          <BrandMark className="size-5" />
          <span className="font-extrabold tracking-[-0.045em]">
            {siteConfig.name}
          </span>
        </span>
        <a
          href={siteConfig.links.rapture}
          className="flex items-center gap-2 text-sm transition-transform duration-200 hover:scale-105 motion-reduce:hover:scale-100"
        >
          <span className="text-muted-foreground">Made by</span>
          <RaptureWordmark className="h-3 text-foreground" />
        </a>
        <a
          href={siteConfig.links.github}
          aria-label={`${siteConfig.name} on GitHub`}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <GithubIcon className="size-5" />
        </a>
      </div>
    </footer>
  );
}
