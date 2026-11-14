"use client";

import { Download } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { PdfInput } from "~/components/tools/pdf-input";
import { FileActions } from "~/components/tools/tool-actions";
import {
  Segmented,
  ToolField,
  ToolOptions,
  ToolSlider,
} from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { usePdfFile } from "~/hooks/use-pdf-file";
import { downloadBlob } from "~/lib/download";
import { canvasToBlob } from "~/lib/image/canvas";
import { renderPage } from "~/lib/pdf/document";
import { formatBytes } from "~/utils/bytes";
import { IMAGE_FORMATS, type ImageFormat } from "~/utils/image-format";
import { PageRangeError, parsePageRange } from "~/utils/page-range";
import { PAGE_SIZES, pageImageName, pagesZipName } from "~/utils/pdf-to-image";

const FORMATS = [
  { value: "png" as const, label: IMAGE_FORMATS.png.label },
  { value: "jpeg" as const, label: IMAGE_FORMATS.jpeg.label },
];

const SIZES = PAGE_SIZES.map((size) => ({
  value: String(size.value),
  label: size.label,
}));

interface Rendered {
  page: number;
  blob: Blob;
  url: string;
}

export function PdfToImageTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("");
  const [format, setFormat] = useState<ImageFormat>("png");
  const [size, setSize] = useState("1600");
  const [quality, setQuality] = useState(90);
  const [pages, setPages] = useState<Rendered[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rangeId = useId();

  const file = files[0] ?? null;
  const { pdf, pages: total, error: loadError } = usePdfFile(file);

  useEffect(() => {
    return () => {
      for (const page of pages) {
        URL.revokeObjectURL(page.url);
      }
    };
  }, [pages]);

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

  const render = async () => {
    if (!pdf || chosen.pages.length === 0) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const drawn: Rendered[] = [];

      for (const page of chosen.pages) {
        const canvas = await renderPage(pdf, page, { maxSide: Number(size) });
        const blob = await canvasToBlob(canvas, format, quality / 100);
        drawn.push({ page, blob, url: URL.createObjectURL(blob) });
      }

      setPages(drawn);
    } catch {
      setError("Those pages could not be drawn.");
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!file || pages.length === 0) {
      return;
    }

    const { zipSync } = await import("fflate");
    const entries: Record<string, Uint8Array> = {};

    for (const page of pages) {
      entries[pageImageName(file.name, page.page, format)] = new Uint8Array(
        await page.blob.arrayBuffer(),
      );
    }

    downloadBlob(
      new Blob([zipSync(entries, { level: 0 }) as BlobPart], {
        type: "application/zip",
      }),
      pagesZipName(file.name),
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <PdfInput
        files={files}
        onFiles={setFiles}
        error={error ?? loadError}
        hint="Every page is drawn in this tab, so the file stays with you."
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
                onChange={(event) => setRange(event.target.value)}
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
                value={format}
                options={FORMATS}
                onChange={setFormat}
              />
              <Segmented
                label="Size"
                value={size}
                options={SIZES}
                onChange={setSize}
              />
            </ToolOptions>
            {format === "jpeg" && (
              <ToolSlider
                label="Quality"
                value={quality}
                min={40}
                max={100}
                display={`${quality}%`}
                onChange={setQuality}
              />
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={render}
                disabled={busy || chosen.pages.length === 0}
              >
                {busy ? "Drawing the pages" : "Draw the pages"}
              </Button>
              {pages.length > 0 && (
                <Button type="button" variant="secondary" onClick={downloadZip}>
                  <Download />
                  All {pages.length} as a zip
                </Button>
              )}
            </div>
          </div>
          {pages.length > 0 && (
            <ToolField label="Pages">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {pages.map((page) => (
                  <li
                    key={page.page}
                    className="flex flex-col gap-2 rounded-2xl bg-card p-2"
                  >
                    <img
                      src={page.url}
                      alt={`Page ${page.page}`}
                      className="w-full rounded-xl bg-muted object-contain"
                    />
                    <div className="flex items-center justify-between gap-2 px-1 pb-1">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {page.page} · {formatBytes(page.blob.size)}
                      </span>
                      <FileActions
                        image
                        file={() =>
                          file
                            ? {
                                blob: page.blob,
                                name: pageImageName(
                                  file.name,
                                  page.page,
                                  format,
                                ),
                              }
                            : null
                        }
                      />
                    </div>
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
