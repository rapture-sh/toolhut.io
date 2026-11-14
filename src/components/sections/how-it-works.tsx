import { Check, FileLock2, FileText } from "lucide-react";

function LoadOnce() {
  return (
    <div className="flex h-36 flex-col justify-center gap-4 rounded-2xl bg-card px-6">
      <div className="flex gap-1.5">
        <span className="size-2 rounded-full bg-muted-foreground/30" />
        <span className="size-2 rounded-full bg-muted-foreground/30" />
        <span className="size-2 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="anim-fill h-full rounded-full bg-tag-dev" />
      </div>
      <span className="font-mono text-xs text-muted-foreground">
        toolhut.io
      </span>
    </div>
  );
}

function WorkHere() {
  return (
    <div className="flex h-36 items-center justify-center gap-4 rounded-2xl bg-card">
      <span className="anim-breathe flex size-12 items-center justify-center rounded-2xl bg-tag-data text-tag-on">
        <FileText className="size-5" strokeWidth={1.8} />
      </span>
      <span className="anim-turn size-6 rounded-full border-2 border-dashed border-tag-data/60" />
      <span className="flex size-12 items-center justify-center rounded-2xl bg-tag-data/15 text-tag-data">
        <Check className="size-5" strokeWidth={2} />
      </span>
    </div>
  );
}

function KeepNothing() {
  return (
    <div className="relative flex h-36 items-center justify-center rounded-2xl bg-card">
      <span className="absolute size-12 rounded-2xl border-2 border-dashed border-muted-foreground/25" />
      <span className="anim-vanish flex size-12 items-center justify-center rounded-2xl bg-tag-image text-tag-on">
        <FileLock2 className="size-5" strokeWidth={1.8} />
      </span>
    </div>
  );
}

const STEPS = [
  {
    number: "01",
    ink: "text-tag-dev",
    title: "Load once",
    body: "After that it works with the network off.",
    art: LoadOnce,
  },
  {
    number: "02",
    ink: "text-tag-data",
    title: "Work here",
    body: "Your file is processed on your own processor.",
    art: WorkHere,
  },
  {
    number: "03",
    ink: "text-tag-image",
    title: "Keep nothing",
    body: "Close the tab and every trace is gone.",
    art: KeepNothing,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-44"
    >
      <ol className="grid gap-10 sm:grid-cols-3 sm:gap-6">
        {STEPS.map((step) => (
          <li key={step.number}>
            <step.art />
            <span className={`mt-6 block font-mono text-xs ${step.ink}`}>
              {step.number}
            </span>
            <h3 className="mt-3 text-xl font-bold tracking-[-0.03em]">
              {step.title}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.7] text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
