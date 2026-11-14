"use client";

import { PDFDocument } from "@cantoo/pdf-lib";
import { useState } from "react";
import { PdfInput } from "~/components/tools/pdf-input";
import { FileActions } from "~/components/tools/tool-actions";
import { Segmented, ToolField, ToolOptions } from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { usePdfFile } from "~/hooks/use-pdf-file";
import { canvasToBlob } from "~/lib/image/canvas";
import { pageSize, renderPage } from "~/lib/pdf/document";
import { formatBytes } from "~/utils/bytes";
import {
  COMPRESS_LEVELS,
  compressedName,
  levelFor,
  type SizeChange,
  sizeChange,
} from "~/utils/pdf-compress";

const LEVELS = COMPRESS_LEVELS.map((level) => ({
  value: level.value,
  label: level.label,
}));

interface Result {
  blob: Blob;
  change: SizeChange;
}

export function PdfCompressTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [level, setLevel] = useState("balanced");
  const [result, setResult] = useState<Result | null>(null);
  const [done, setDone] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const file = files[0] ?? null;
  const { pdf, pages, error: loadError } = usePdfFile(file);

  const compress = async () => {
    if (!pdf || !file) {
      return;
    }

    setBusy(true);
    setError(null);
    setResult(null);
    setDone(0);

    try {
      const { maxSide, quality } = levelFor(level);

      // Every page is drawn first, then the document is written, so pdf.js
      // and the writer never work at the same time.
      const drawn: { bytes: ArrayBuffer; width: number; height: number }[] = [];

      for (let page = 1; page <= pages; page += 1) {
        const size = await pageSize(pdf, page);
        const canvas = await renderPage(pdf, page, { maxSide });
        const blob = await canvasToBlob(canvas, "jpeg", quality);
        drawn.push({
          bytes: await blob.arrayBuffer(),
          width: size.width,
          height: size.height,
        });
        setDone(page);
      }

      const built = await PDFDocument.create();

      for (const page of drawn) {
        const image = await built.embedJpg(page.bytes);
        const sheet = built.addPage([page.width, page.height]);
        sheet.drawImage(image, {
          x: 0,
          y: 0,
          width: page.width,
          height: page.height,
        });
      }

      const bytes = await built.save();
      const smaller = new Blob([bytes as BlobPart], {
        type: "application/pdf",
      });

      setResult({ blob: smaller, change: sizeChange(file.size, smaller.size) });
    } catch {
      setError("That document could not be redrawn.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PdfInput
        files={files}
        onFiles={(picked) => {
          setFiles(picked);
          setResult(null);
        }}
        error={error ?? loadError}
        hint="Best on a scan or a photo heavy document."
      />
      {pages > 0 && (
        <>
          <div className="flex flex-col gap-4 rounded-2xl bg-card p-4">
            <ToolOptions>
              <Segmented
                label="Quality"
                value={level}
                options={LEVELS}
                onChange={(next) => {
                  setLevel(next);
                  setResult(null);
                }}
              />
            </ToolOptions>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every page is redrawn as a picture at the quality you pick, which
              is what makes a heavy scan small. The pages look the same, but the
              text in them stops being text you can select or search.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={compress} disabled={busy}>
                {busy ? `Redrawing page ${done} of ${pages}` : "Redraw smaller"}
              </Button>
              <span
                aria-live="polite"
                className="text-sm text-muted-foreground"
              >
                {pages} {pages === 1 ? "page" : "pages"},{" "}
                {file ? formatBytes(file.size) : ""}
              </span>
            </div>
          </div>
          {result && file && (
            <ToolField
              label="Result"
              action={
                <FileActions
                  copyable={false}
                  file={() => ({
                    blob: result.blob,
                    name: compressedName(file.name),
                  })}
                />
              }
            >
              <p
                aria-live="polite"
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-card p-4 font-mono text-sm text-muted-foreground tabular-nums"
              >
                <span>{formatBytes(file.size)}</span>
                <span aria-hidden="true">to</span>
                <span className="text-foreground">
                  {formatBytes(result.blob.size)}
                </span>
                <span
                  className={
                    result.change.smaller ? "text-tag-pdf" : "text-destructive"
                  }
                >
                  {result.change.label}
                </span>
              </p>
            </ToolField>
          )}
        </>
      )}
    </div>
  );
}
