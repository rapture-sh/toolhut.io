"use client";

import { Download } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PdfInput } from "~/components/tools/pdf-input";
import { FileActions } from "~/components/tools/tool-actions";
import { Segmented, ToolField, ToolOptions } from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { usePdfFile } from "~/hooks/use-pdf-file";
import { downloadBlob } from "~/lib/download";
import { canvasToBlob } from "~/lib/image/canvas";
import { collectPages, loadPdf, PdfWriteError, savePdf } from "~/lib/pdf/build";
import { renderPage } from "~/lib/pdf/document";
import { formatBytes } from "~/utils/bytes";
import { PageRangeError, parsePageRange } from "~/utils/page-range";
import {
  SPLIT_MODES,
  type SplitMode,
  splitName,
  splitPieces,
  splitZipName,
} from "~/utils/pdf-split";

/** How many pages the strip previews, so a long range stays quick. */
const STRIP_LIMIT = 24;

interface Written {
  name: string;
  blob: Blob;
}

function plan(pieces: number, chosen: number, total: number): string {
  if (pieces === 0) {
    return "Choose at least one page.";
  }

  const files = pieces === 1 ? "One file" : `${pieces} files`;

  return `${files} from ${chosen} of ${total} pages.`;
}

export function PdfSplitTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("");
  const [mode, setMode] = useState<SplitMode>("one");
  const [results, setResults] = useState<Written[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const drawn = useRef<Set<number>>(new Set());
  const urls = useRef<string[]>([]);
  const rangeId = useId();

  const file = files[0] ?? null;
  const { pdf, pages: total, error: loadError } = usePdfFile(file);

  const chosen = useMemo(() => {
    if (total === 0) {
      return { pages: [] as number[], error: null };
    }

    try {
      return { pages: parsePageRange(range, total), error: null };
    } catch (thrown) {
      if (thrown instanceof PageRangeError) {
        return { pages: [] as number[], error: thrown.message };
      }
      throw thrown;
    }
  }, [range, total]);

  const unique = useMemo(() => [...new Set(chosen.pages)], [chosen.pages]);
  const strip = useMemo(() => unique.slice(0, STRIP_LIMIT), [unique]);
  const pieces = useMemo(
    () => splitPieces(chosen.pages, mode),
    [chosen.pages, mode],
  );

  useEffect(() => {
    return () => {
      for (const url of urls.current) {
        URL.revokeObjectURL(url);
      }
      urls.current = [];
    };
  }, []);

  useEffect(() => {
    if (!pdf) {
      return;
    }

    let cancelled = false;

    const draw = async () => {
      for (const page of strip) {
        if (drawn.current.has(page)) {
          continue;
        }
        drawn.current.add(page);

        try {
          const canvas = await renderPage(pdf, page, { maxSide: 200 });
          const blob = await canvasToBlob(canvas, "png");

          if (cancelled) {
            return;
          }

          const url = URL.createObjectURL(blob);
          urls.current.push(url);
          setThumbnails((current) => ({ ...current, [page]: url }));
        } catch {
          if (!cancelled) {
            setError("Those pages could not be drawn.");
          }
        }
      }
    };

    void draw();

    return () => {
      cancelled = true;
    };
  }, [pdf, strip]);

  const take = (next: File[]) => {
    for (const url of urls.current) {
      URL.revokeObjectURL(url);
    }
    urls.current = [];
    drawn.current = new Set();

    setFiles(next);
    setRange("");
    setThumbnails({});
    setResults([]);
    setError(null);
  };

  const choose = (next: string) => {
    setRange(next);
    setResults([]);
  };

  const chooseMode = (next: SplitMode) => {
    setMode(next);
    setResults([]);
  };

  const split = async () => {
    if (!file || pieces.length === 0) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const source = await loadPdf(file);
      const written: Written[] = [];

      for (const piece of pieces) {
        const built = await collectPages(
          [source],
          piece.pages.map((page) => ({ source: 0, page })),
        );

        written.push({
          name: splitName(file.name, piece.label),
          blob: await savePdf(built),
        });
      }

      setResults(written);
    } catch (thrown) {
      setResults([]);
      setError(
        thrown instanceof PdfWriteError
          ? thrown.message
          : "Those pages could not be pulled out.",
      );
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!file || results.length === 0) {
      return;
    }

    const { zipSync } = await import("fflate");
    const entries: Record<string, Uint8Array> = {};

    for (const result of results) {
      entries[result.name] = new Uint8Array(await result.blob.arrayBuffer());
    }

    downloadBlob(
      new Blob([zipSync(entries, { level: 0 }) as BlobPart], {
        type: "application/zip",
      }),
      splitZipName(file.name),
    );
  };

  const single = results.length === 1 ? results[0] : null;
  const status = single
    ? `${single.name}, ${formatBytes(single.blob.size)}.`
    : results.length > 1
      ? `${results.length} files, ready to save.`
      : plan(pieces.length, chosen.pages.length, total);

  return (
    <div className="flex flex-col gap-5">
      <PdfInput
        files={files}
        onFiles={take}
        error={error ?? loadError}
        hint="The pages are pulled out in this tab, so the file stays with you."
      />
      {total > 0 && (
        <>
          <div className="flex flex-col gap-4 rounded-2xl bg-card p-4">
            <div className="flex flex-col gap-2">
              <label htmlFor={rangeId} className="text-sm font-medium">
                Pages
              </label>
              <Input
                id={rangeId}
                value={range}
                onChange={(event) => choose(event.target.value)}
                placeholder={`All ${total} pages, or 1-3, 7`}
                className="font-mono"
              />
              {chosen.error ? (
                <p className="text-sm text-destructive">{chosen.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {chosen.pages.length} of {total} pages.
                </p>
              )}
            </div>
            <ToolOptions>
              <Segmented
                label="Save as"
                value={mode}
                options={SPLIT_MODES}
                onChange={chooseMode}
              />
            </ToolOptions>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={split}
                disabled={busy || pieces.length === 0}
              >
                {busy ? "Pulling the pages out" : "Split"}
              </Button>
              {single && (
                <FileActions
                  file={() => ({ blob: single.blob, name: single.name })}
                  copyable={false}
                />
              )}
              {results.length > 1 && (
                <Button type="button" variant="secondary" onClick={downloadZip}>
                  <Download />
                  All {results.length} as a zip
                </Button>
              )}
            </div>
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {status}
              {results.length > 1 &&
                " A zip cannot go on the clipboard, so it is download only."}
            </p>
          </div>
          {strip.length > 0 && (
            <ToolField label="Chosen pages">
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {strip.map((page) => (
                  <li
                    key={page}
                    className="flex flex-col gap-2 rounded-2xl bg-card p-2"
                  >
                    {thumbnails[page] ? (
                      <img
                        src={thumbnails[page]}
                        alt={`Page ${page}`}
                        className="w-full rounded-xl bg-muted object-contain"
                      />
                    ) : (
                      <div className="aspect-3/4 w-full rounded-xl bg-muted" />
                    )}
                    <span className="px-1 pb-1 font-mono text-xs text-muted-foreground tabular-nums">
                      {page}
                    </span>
                  </li>
                ))}
              </ul>
              {unique.length > strip.length && (
                <p className="text-sm text-muted-foreground">
                  The first {strip.length} of {unique.length} pages are shown.
                  All of them are saved.
                </p>
              )}
            </ToolField>
          )}
          {results.length > 1 && (
            <ToolField label="Files">
              <ul className="flex flex-col gap-1">
                {results.map((result) => (
                  <li
                    key={result.name}
                    className="flex items-center gap-3 rounded-xl bg-card px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {result.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                      {formatBytes(result.blob.size)}
                    </span>
                    <FileActions
                      file={() => ({ blob: result.blob, name: result.name })}
                      copyable={false}
                    />
                  </li>
                ))}
              </ul>
            </ToolField>
          )}
        </>
      )}
    </div>
  );
}
