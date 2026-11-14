"use client";

import { Loader2, RotateCcw, RotateCw, Trash2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PdfInput } from "~/components/tools/pdf-input";
import { SortableGrid } from "~/components/tools/sortable-grid";
import { FileActions, type OutputFile } from "~/components/tools/tool-actions";
import { Button } from "~/components/ui/button";
import { usePdfFile } from "~/hooks/use-pdf-file";
import { canvasToBlob } from "~/lib/image/canvas";
import { collectPages, loadPdf, PdfWriteError, savePdf } from "~/lib/pdf/build";
import { renderPage } from "~/lib/pdf/document";
import { cn } from "~/lib/utils";
import {
  dropPage,
  keptPages,
  organizedName,
  type PageCard,
  pagesFrom,
  restorePage,
  summary,
  turnAll,
  turnPage,
} from "~/utils/pdf-organizer";

const THUMB_SIDE = 260;

const TURN_CLASS: Record<number, string> = {
  0: "rotate-0",
  1: "rotate-90",
  2: "rotate-180",
  3: "-rotate-90",
};

export function PdfOrganizerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [cards, setCards] = useState<PageCard[]>([]);
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const urls = useRef<string[]>([]);

  const file = files[0] ?? null;
  const { pdf, pages: total, error: loadError, loading } = usePdfFile(file);

  const release = useCallback(() => {
    for (const url of urls.current) {
      URL.revokeObjectURL(url);
    }
    urls.current = [];
  }, []);

  useEffect(() => release, [release]);

  useEffect(() => {
    release();
    setThumbs({});
    setCards(pagesFrom(pdf ? pdf.numPages : 0));
    setError(null);
  }, [pdf, release]);

  useEffect(() => {
    if (!pdf) {
      return;
    }

    let cancelled = false;

    const draw = async () => {
      for (let page = 1; page <= pdf.numPages; page += 1) {
        if (cancelled) {
          return;
        }

        try {
          const canvas = await renderPage(pdf, page, { maxSide: THUMB_SIDE });
          const blob = await canvasToBlob(canvas, "jpeg", 0.7);

          if (cancelled) {
            return;
          }

          const url = URL.createObjectURL(blob);
          urls.current.push(url);
          setThumbs((previous) => ({ ...previous, [page]: url }));
        } catch {
          if (!cancelled) {
            setError("Some pages could not be drawn, the rest still work.");
          }
        }
      }
    };

    void draw();

    return () => {
      cancelled = true;
    };
  }, [pdf]);

  const counts = useMemo(() => summary(cards), [cards]);
  const drawn = Object.keys(thumbs).length;

  const build = async (): Promise<OutputFile | null> => {
    if (!file) {
      return null;
    }

    const picks = keptPages(cards);

    if (picks.length === 0) {
      setError("Keep at least one page.");
      return null;
    }

    setError(null);

    try {
      const source = await loadPdf(file);
      const built = await collectPages([source], picks);

      return { blob: await savePdf(built), name: organizedName(file.name) };
    } catch (thrown) {
      setError(
        thrown instanceof PdfWriteError
          ? thrown.message
          : "That PDF could not be saved.",
      );

      return null;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PdfInput
        files={files}
        onFiles={setFiles}
        error={error ?? loadError}
        hint="Every page is drawn in this tab, so the file stays with you."
      />
      {loading && (
        <p className="text-sm text-muted-foreground">Opening the document.</p>
      )}
      {total > 0 && (
        <>
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-1">
              <p aria-live="polite" className="text-sm font-medium">
                {counts.kept} of {counts.total}{" "}
                {counts.total === 1 ? "page" : "pages"} kept
                {counts.turned > 0 ? `, ${counts.turned} turned` : ""}
              </p>
              {drawn < counts.total && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
                  Drawing page {Math.min(drawn + 1, counts.total)} of{" "}
                  {counts.total}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCards((previous) => turnAll(previous))}
              >
                <RotateCw />
                Rotate all
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCards(pagesFrom(total));
                  setError(null);
                }}
              >
                <RotateCcw />
                Reset
              </Button>
            </div>
          </div>
          <SortableGrid
            items={cards}
            keyOf={(card) => card.id}
            onReorder={setCards}
            label="Pages"
          >
            {(card) => (
              <>
                <div
                  className={cn(
                    "flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted p-1",
                    card.dropped && "opacity-40",
                  )}
                >
                  {thumbs[card.page] ? (
                    <img
                      src={thumbs[card.page]}
                      alt={`Page ${card.page}`}
                      className={cn(
                        "max-h-full max-w-full object-contain transition-transform",
                        TURN_CLASS[card.turns],
                      )}
                    />
                  ) : (
                    <span className="h-full w-3/4 animate-pulse rounded-lg bg-background" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 px-1 pb-1">
                  <span className="min-w-0 truncate font-mono text-xs text-muted-foreground tabular-nums">
                    {card.dropped ? `${card.page} dropped` : card.page}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {card.dropped ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Restore page ${card.page}`}
                        onClick={() =>
                          setCards((previous) => restorePage(previous, card.id))
                        }
                      >
                        <Undo2 />
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Turn page ${card.page} clockwise`}
                          onClick={() =>
                            setCards((previous) => turnPage(previous, card.id))
                          }
                        >
                          <RotateCw />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Drop page ${card.page}`}
                          onClick={() =>
                            setCards((previous) => dropPage(previous, card.id))
                          }
                        >
                          <Trash2 />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </SortableGrid>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4">
            <p className="max-w-md text-sm text-muted-foreground">
              Saved as a new PDF with the pages in this order. A PDF cannot go
              on the clipboard, so this one is download only.
            </p>
            <FileActions
              file={build}
              copyable={false}
              disabled={counts.kept === 0}
            />
          </div>
        </>
      )}
    </div>
  );
}
