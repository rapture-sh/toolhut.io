import { ArrowUpRight, Heart } from "lucide-react";
import { GithubIcon } from "~/components/icons/github";
import { Button } from "~/components/ui/button";
import { siteConfig } from "~/config/site";

export function Contribute() {
  return (
    <section
      id="contribute"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-44 pb-28"
    >
      <div className="on-lavender relative isolate overflow-hidden rounded-[36px] bg-primary px-8 py-16 text-primary-foreground sm:px-16 sm:py-20">
        <span
          aria-hidden="true"
          className="pattern-plus-ink pattern-fade-right pointer-events-none absolute inset-0 -z-10"
        />
        <h2 className="max-w-2xl text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-[56px]">
          Do not trust us. Read the code.
        </h2>
        <p className="mt-8 max-w-md text-lg leading-[1.6] text-primary-foreground/75">
          Every line is public and MIT licensed. Check it, fork it, or build the
          next tool.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            asChild
            size="xl"
            className="bg-white text-primary-foreground hover:bg-white/90"
          >
            <a href={siteConfig.links.contributing}>
              <Heart className="fill-heart text-heart transition-transform duration-200 group-hover:scale-110" />
              Contribute
            </a>
          </Button>
          <Button
            asChild
            size="xl"
            variant="ghost"
            className="text-primary-foreground hover:bg-transparent hover:text-primary-foreground hover:opacity-65 dark:hover:bg-transparent"
          >
            <a href={siteConfig.links.github}>
              <GithubIcon className="size-[18px]" />
              Browse the source
              <ArrowUpRight className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
