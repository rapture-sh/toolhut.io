"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PdfInput } from "~/components/tools/pdf-input";
import { SortableGrid } from "~/components/tools/sortable-grid";
import { FileActions } from "~/components/tools/tool-actions";
import { Button } from "~/components/ui/button";
import { canvasToBlob } from "~/lib/image/canvas";
import { collectPages, loadPdf, PdfWriteError, savePdf } from "~/lib/pdf/build";
import { openPdf, PdfReadError, renderPage } from "~/lib/pdf/document";
import { formatBytes } from "~/utils/bytes";
import {
  MergeError,
  mergedName,
  mergePicks,
  totalPages,
} from "~/utils/pdf-merge";

interface Loaded {
  url: string;
  pages: number;
}

interface Merged {
  blob: Blob;
  name: string;
  pages: number;
}

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function pagesLabel(pages: number): string {
  return pages === 1 ? "1 page" : `${pages} pages`;
}

export function PdfMergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [loaded, setLoaded] = useState<Record<string, Loaded>>({});
  const [merged, setMerged] = useState<Merged | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const opened = useRef<Set<string>>(new Set());
  const urls = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      for (const url of urls.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const readThumbnails = async () => {
      for (const file of files) {
        const key = fileKey(file);

        if (opened.current.has(key)) {
          continue;
        }
        opened.current.add(key);

        try {
          const pdf = await openPdf(file);
          const canvas = await renderPage(pdf, 1, { maxSide: 240 });
          const blob = await canvasToBlob(canvas, "png");

          if (cancelled) {
            return;
          }

          const url = URL.createObjectURL(blob);
          urls.current.push(url);
          setLoaded((current) => ({
            ...current,
            [key]: { url, pages: pdf.numPages },
          }));
        } catch (thrown) {
          if (cancelled) {
            return;
          }
          setError(
            thrown instanceof PdfReadError
              ? `${file.name}: ${thrown.message}`
              : `${file.name} could not be opened.`,
          );
        }
      }
    };

    void readThumbnails();

    return () => {
      cancelled = true;
    };
  }, [files]);

  const take = (next: File[]) => {
    setFiles(next);
    setMerged(null);
    setError(null);
  };

  const merge = async () => {
    setBusy(true);
    setError(null);

    try {
      const sources = await Promise.all(files.map((file) => loadPdf(file)));
      const counts = sources.map((source) => source.getPageCount());
      const built = await collectPages(sources, mergePicks(counts));

      setMerged({
        blob: await savePdf(built),
        name: mergedName(files.map((file) => file.name)),
        pages: totalPages(counts),
      });
    } catch (thrown) {
      setMerged(null);
      setError(
        thrown instanceof MergeError || thrown instanceof PdfWriteError
          ? thrown.message
          : "Those PDFs could not be joined.",
      );
    } finally {
      setBusy(false);
    }
  };

  const known = files.map((file) => loaded[fileKey(file)]?.pages ?? 0);
  const status = merged
    ? `${merged.name}, ${pagesLabel(merged.pages)}, ${formatBytes(merged.blob.size)}.`
    : files.length < 2
      ? "Add one more PDF to join them."
      : `${files.length} files, ${pagesLabel(totalPages(known))} in all.`;

  return (
    <div className="flex flex-col gap-5">
      <PdfInput
        files={files}
        onFiles={take}
        multiple
        error={error}
        hint="Every page is joined in this tab, so the files stay with you."
      />
      {files.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Order</p>
            <p className="text-sm text-muted-foreground">
              Drag a file into place, or move it with the arrow keys from its
              handle.
            </p>
            <SortableGrid
              items={files}
              keyOf={fileKey}
              onReorder={take}
              label="File"
            >
              {(file, index) => {
                const page = loaded[fileKey(file)];

                return (
                  <>
                    {page ? (
                      <img
                        src={page.url}
                        alt={`First page of ${file.name}`}
                        className="pointer-events-none w-full rounded-xl bg-muted object-contain"
                      />
                    ) : (
                      <div className="flex aspect-3/4 w-full items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                        Opening
                      </div>
                    )}
                    <div className="flex min-w-0 flex-col gap-0.5 px-1 pb-1">
                      <span className="truncate text-xs font-medium">
                        {file.name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {index + 1} ·{" "}
                        {page ? pagesLabel(page.pages) : formatBytes(file.size)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        take(
                          files.filter(
                            (other) => fileKey(other) !== fileKey(file),
                          ),
                        )
                      }
                      className="absolute top-2 right-2 bg-background/80"
                    >
                      <X />
                    </Button>
                  </>
                );
              }}
            </SortableGrid>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={merge}
                disabled={busy || files.length < 2}
              >
                {busy ? "Joining the files" : "Merge"}
              </Button>
              {merged && (
                <FileActions
                  file={() => ({ blob: merged.blob, name: merged.name })}
                  copyable={false}
                />
              )}
            </div>
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {status}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
