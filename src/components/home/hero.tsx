import { ToolExplorer } from "~/components/home/tool-explorer";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-24 pb-4 sm:pt-32">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
          Tools that never upload your files.
        </h1>
        <p className="mx-auto mt-7 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
          Free, open source tools that run entirely in your browser. Converters,
          encoders, image and PDF utilities.
        </p>
      </div>
      <ToolExplorer />
    </section>
  );
}
