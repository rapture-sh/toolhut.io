import { CloudOff, FileLock2 } from "lucide-react";

export function WhyLocal() {
  return (
    <section
      id="why"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-44"
    >
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <h2 className="max-w-xl text-balance text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-[52px]">
            Converting a file should not mean handing it to a stranger.
          </h2>
          <p className="mt-8 max-w-md text-lg leading-[1.7] text-muted-foreground">
            Every other converter asks you to upload first. Yours never leaves
            the tab.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-5 rounded-3xl bg-primary p-6 text-primary-foreground">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/10">
              <FileLock2 className="size-6" strokeWidth={1.8} />
            </span>
            <span className="text-[17px] font-medium leading-snug">
              Read, converted and handed back, all in this tab.
            </span>
          </div>
          <div className="flex items-center gap-5 rounded-3xl bg-card p-6">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <CloudOff className="size-6" strokeWidth={1.8} />
            </span>
            <span className="text-[17px] leading-snug text-muted-foreground">
              No request is ever made. There is no server to make it to.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
