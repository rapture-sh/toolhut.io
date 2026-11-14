"use client";

import type { PDFDocument } from "@cantoo/pdf-lib";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { DropZone } from "~/components/tools/drop-zone";
import { SortableGrid } from "~/components/tools/sortable-grid";
import { FileActions } from "~/components/tools/tool-actions";
import { Segmented, ToolOptions, ToolSlider } from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import {
  canvasToBlob,
  ImageDecodeError,
  loadImage,
  toCanvas,
} from "~/lib/image/canvas";
import { emptyPdf, PdfWriteError, savePdf } from "~/lib/pdf/build";
import { isImageFile } from "~/lib/read-file";
import { cn } from "~/lib/utils";
import { formatBytes } from "~/utils/bytes";
import {
  ImagesToPdfError,
  MAX_MARGIN_PERCENT,
  ORIENTATIONS,
  type Orientation,
  PAGE_SIZE_LIST,
  PAGE_SIZES,
  type PageSize,
  pdfName,
  planPages,
} from "~/utils/images-to-pdf";

const SIZES = PAGE_SIZE_LIST.map((value) => ({
  value,
  label: PAGE_SIZES[value].label,
}));

interface Picked {
  id: string;
  file: File;
  /** The preview, released when the card goes or the tool does. */
  url: string;
  width: number;
  height: number;
}

interface Built {
  blob: Blob;
  name: string;
  pages: number;
}

/**
 * JPEG and PNG are the two things a PDF holds as they are. Everything else,
 * an SVG above all, has to become pixels on a canvas first.
 */
async function embedImage(pdf: PDFDocument, file: File) {
  if (file.type === "image/jpeg") {
    return await pdf.embedJpg(await file.arrayBuffer());
  }

  if (file.type === "image/png") {
    return await pdf.embedPng(await file.arrayBuffer());
  }

  const bitmap = await loadImage(file);

  try {
    const drawn = await canvasToBlob(toCanvas(bitmap), "png");

    return await pdf.embedPng(await drawn.arrayBuffer());
  } finally {
    bitmap.close();
  }
}

function pageCount(pages: number): string {
  return pages === 1 ? "1 page" : `${pages} pages`;
}

function problem(thrown: unknown): string {
  if (
    thrown instanceof ImagesToPdfError ||
    thrown instanceof PdfWriteError ||
    thrown instanceof ImageDecodeError
  ) {
    return thrown.message;
  }

  return "That PDF could not be built.";
}

export function ImagesToPdfTool() {
  const [images, setImages] = useState<Picked[]>([]);
  const [size, setSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState(5);
  const [built, setBuilt] = useState<Built | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const shown = useRef<Picked[]>([]);
  const inputId = useId();

  useEffect(() => {
    shown.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      for (const item of shown.current) {
        URL.revokeObjectURL(item.url);
      }
    };
  }, []);

  const take = async (picked: File[]) => {
    const files = picked.filter(isImageFile);

    if (files.length === 0) {
      setError("Those files are not images.");
      return;
    }

    setError(null);
    const added: Picked[] = [];

    for (const file of files) {
      try {
        const bitmap = await loadImage(file);
        added.push({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          width: bitmap.width,
          height: bitmap.height,
        });
        bitmap.close();
      } catch {
        setError(`${file.name} is not an image this browser can read.`);
      }
    }

    if (added.length > 0) {
      setImages((existing) => [...existing, ...added]);
      setBuilt(null);
    }
  };

  /** Any change to the pile makes a PDF built from the old one stale. */
  const changeImages = (items: Picked[]) => {
    setImages(items);
    setBuilt(null);
  };

  const remove = (id: string) => {
    const going = images.find((item) => item.id === id);

    if (going) {
      URL.revokeObjectURL(going.url);
    }

    changeImages(images.filter((item) => item.id !== id));
  };

  const clear = () => {
    for (const item of images) {
      URL.revokeObjectURL(item.url);
    }

    changeImages([]);
    setError(null);
  };

  const pickSize = (value: PageSize) => {
    setSize(value);
    setBuilt(null);
  };

  const pickOrientation = (value: Orientation) => {
    setOrientation(value);
    setBuilt(null);
  };

  const pickMargin = (value: number) => {
    setMargin(value);
    setBuilt(null);
  };

  const build = async () => {
    setBusy(true);
    setError(null);

    try {
      const plan = planPages(
        images.map((item) => ({ width: item.width, height: item.height })),
        { size, orientation, marginPercent: margin },
      );
      const pdf = await emptyPdf();

      for (const [index, item] of images.entries()) {
        const layout = plan[index];

        if (!layout) {
          continue;
        }

        const drawn = await embedImage(pdf, item.file);
        const page = pdf.addPage([layout.page.width, layout.page.height]);

        page.drawImage(drawn, {
          x: layout.image.x,
          y: layout.page.height - layout.image.y - layout.image.height,
          width: layout.image.width,
          height: layout.image.height,
        });
      }

      const first = images[0];

      setBuilt({
        blob: await savePdf(pdf),
        name: pdfName(first ? first.file.name : "images", images.length),
        pages: images.length,
      });
    } catch (thrown) {
      setBuilt(null);
      setError(problem(thrown));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <DropZone onFiles={take} label="Drop images here" paste>
        <div
          className={cn(
            "flex w-full flex-col items-center justify-center gap-4 rounded-2xl bg-card p-6",
            images.length > 0 ? "min-h-0 py-4" : "min-h-56",
          )}
        >
          <input
            ref={input}
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            aria-label="Choose images"
            className="sr-only"
            onChange={(event) => {
              void take(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
          {images.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span aria-live="polite">
                {images.length === 1 ? "1 image" : `${images.length} images`}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => input.current?.click()}
              >
                Add more
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clear}>
                Remove all
              </Button>
            </div>
          ) : (
            <>
              <ImagePlus
                className="size-8 text-muted-foreground"
                strokeWidth={1.5}
              />
              <div className="text-center">
                <p className="font-medium">Drop images, or paste them</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The PDF is written in this tab, so your pictures never leave
                  your browser.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => input.current?.click()}
              >
                Choose files
              </Button>
            </>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </DropZone>
      {images.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">
              Drag a card to change the order the pages come out in.
            </p>
            <SortableGrid
              items={images}
              keyOf={(item) => item.id}
              onReorder={changeImages}
              label="Images"
            >
              {(item) => (
                <>
                  <img
                    src={item.url}
                    alt={item.file.name}
                    className="h-28 w-full rounded-xl bg-muted object-contain"
                  />
                  <div className="flex min-w-0 items-center gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {item.file.name}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground tabular-nums">
                        {item.width} x {item.height}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${item.file.name}`}
                      onClick={() => remove(item.id)}
                    >
                      <X />
                    </Button>
                  </div>
                </>
              )}
            </SortableGrid>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-card p-4">
            <ToolOptions>
              <Segmented
                label="Page size"
                value={size}
                options={SIZES}
                onChange={pickSize}
              />
              {size !== "fit" && (
                <Segmented
                  label="Orientation"
                  value={orientation}
                  options={ORIENTATIONS}
                  onChange={pickOrientation}
                />
              )}
            </ToolOptions>
            <ToolSlider
              label="Margin"
              value={margin}
              min={0}
              max={MAX_MARGIN_PERCENT}
              display={`${margin}%`}
              onChange={pickMargin}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={build} disabled={busy}>
                {busy ? "Building the PDF" : "Build the PDF"}
              </Button>
              {built && <FileActions file={() => built} copyable={false} />}
            </div>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {built
                ? `${pageCount(built.pages)}, ${formatBytes(built.blob.size)}. A PDF cannot go on the clipboard, so this one is download only.`
                : `${pageCount(images.length)} to build, one image each.`}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
