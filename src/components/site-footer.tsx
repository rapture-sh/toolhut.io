export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-8 text-sm text-muted">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Everything here runs in your browser. Your data never leaves the page.
        </p>
        <p className="flex gap-4">
          <a
            className="hover:text-foreground"
            href="https://github.com/rapture-sh/toolhut.io"
          >
            Source
          </a>
          <a className="hover:text-foreground" href="https://rapture.sh">
            Rapture.sh
          </a>
        </p>
      </div>
    </footer>
  );
}
