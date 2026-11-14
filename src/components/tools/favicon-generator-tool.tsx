"use client";

import { zipSync } from "fflate";
import { Download } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { ImageInput } from "~/components/tools/image-input";
import { FileActions } from "~/components/tools/tool-actions";
import { ToolField, ToolOptions } from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { useImageFile } from "~/hooks/use-image-file";
import { downloadBlob } from "~/lib/download";
import {
  canvasToBlob,
  ImageDecodeError,
  resizeCanvas,
  toCanvas,
} from "~/lib/image/canvas";
import { formatBytes } from "~/utils/bytes";
import {
  FaviconError,
  ICON_SPECS,
  type IconSpec,
  safeAreaArtwork,
  safeAreaInset,
  sourceWarnings,
  specKey,
  ZIP_NAME,
} from "~/utils/favicon-generator";

interface Icon {
  key: string;
  name: string;
  size: number;
  label: string;
  blob: Blob;
  url: string;
}

/**
 * Draws the artwork into the middle of a square icon. The shared canvas
 * helpers always fill the frame, and a maskable icon needs the padding.
 */
function insetOnSquare(
  inner: HTMLCanvasElement,
  size: number,
  padding: number,
  background?: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new ImageDecodeError("This browser cannot draw on a canvas.");
  }

  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, size, size);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    inner,
    padding,
    padding,
    size - padding * 2,
    size - padding * 2,
  );

  return canvas;
}

async function renderIcon(
  bitmap: ImageBitmap,
  spec: IconSpec,
  background: string,
): Promise<Blob> {
  const fill = spec.opaque ? background : undefined;

  if (!spec.maskable) {
    const resized = await resizeCanvas(bitmap, spec.size, spec.size);
    return canvasToBlob(toCanvas(resized, spec.size, spec.size, fill), "png");
  }

  const artwork = safeAreaArtwork(spec.size);
  const inner = await resizeCanvas(bitmap, artwork, artwork);

  return canvasToBlob(
    insetOnSquare(inner, spec.size, safeAreaInset(spec.size), fill),
    "png",
  );
}

export function FaviconGeneratorTool() {
  const fieldId = useId();
  const backgroundId = `${fieldId}-background`;
  const [file, setFile] = useState<File | null>(null);
  const [chosen, setChosen] = useState<string[]>(() => ICON_SPECS.map(specKey));
  const [background, setBackground] = useState("#ffffff");
  const [icons, setIcons] = useState<Icon[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { bitmap, url, error: loadError } = useImageFile(file);

  const warnings = useMemo(() => {
    if (!bitmap) {
      return [];
    }

    try {
      return sourceWarnings(bitmap.width, bitmap.height);
    } catch (thrown) {
      return thrown instanceof FaviconError ? [thrown.message] : [];
    }
  }, [bitmap]);

  const needsBackground = ICON_SPECS.some(
    (spec) => spec.opaque && chosen.includes(specKey(spec)),
  );

  useEffect(() => {
    if (!bitmap) {
      setIcons([]);
      return;
    }

    let cancelled = false;
    const urls: string[] = [];

    // The old previews are revoked on the way out, so drop them first.
    setIcons([]);
    setDrawing(true);

    const build = async () => {
      try {
        const made: Icon[] = [];

        for (const spec of ICON_SPECS) {
          const key = specKey(spec);
          if (!chosen.includes(key)) {
            continue;
          }

          const blob = await renderIcon(bitmap, spec, background);
          if (cancelled) {
            return;
          }

          const objectUrl = URL.createObjectURL(blob);
          urls.push(objectUrl);
          made.push({
            key,
            name: key,
            size: spec.size,
            label: spec.label,
            blob,
            url: objectUrl,
          });
        }

        if (!cancelled) {
          setIcons(made);
          setError(null);
        }
      } catch (thrown) {
        if (!cancelled) {
          setIcons([]);
          setError(
            thrown instanceof ImageDecodeError || thrown instanceof FaviconError
              ? thrown.message
              : "Those icons could not be drawn from this image.",
          );
        }
      } finally {
        if (!cancelled) {
          setDrawing(false);
        }
      }
    };

    void build();

    return () => {
      cancelled = true;
      for (const objectUrl of urls) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [bitmap, chosen, background]);

  const toggle = useCallback((key: string, on: boolean) => {
    setChosen((current) =>
      on ? [...current, key] : current.filter((value) => value !== key),
    );
  }, []);

  const downloadZip = useCallback(async () => {
    if (icons.length === 0) {
      return;
    }

    const entries: Record<string, Uint8Array> = {};
    for (const icon of icons) {
      entries[icon.name] = new Uint8Array(await icon.blob.arrayBuffer());
    }

    // PNG bytes are already deflated, so storing them keeps the zip instant.
    const zipped = zipSync(entries, { level: 0 });
    downloadBlob(new Blob([zipped], { type: "application/zip" }), ZIP_NAME);
  }, [icons]);

  return (
    <div className="flex flex-col gap-5">
      <ImageInput
        file={file}
        onFile={setFile}
        url={url}
        error={loadError}
        hint="A square PNG or SVG of at least 512 pixels works best. It never leaves your browser."
      />
      {warnings.length > 0 && (
        <div aria-live="polite" className="flex flex-col gap-1">
          {warnings.map((warning) => (
            <p key={warning} className="text-sm text-muted-foreground">
              {warning}
            </p>
          ))}
        </div>
      )}
      {bitmap && (
        <>
          <ToolField label="Sizes">
            <div className="grid gap-3 rounded-2xl bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
              {ICON_SPECS.map((spec) => {
                const key = specKey(spec);
                const checkboxId = `${fieldId}-${key}`;
                return (
                  <label
                    key={key}
                    htmlFor={checkboxId}
                    className="flex cursor-pointer items-center gap-2.5 text-sm"
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={chosen.includes(key)}
                      onCheckedChange={(checked) =>
                        toggle(key, checked === true)
                      }
                    />
                    <span>
                      {spec.maskable
                        ? `${spec.size} px maskable`
                        : `${spec.size} px`}
                    </span>
                    <span className="text-muted-foreground">{spec.label}</span>
                  </label>
                );
              })}
            </div>
          </ToolField>
          {needsBackground && (
            <ToolOptions>
              <label
                htmlFor={backgroundId}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
              >
                Background for the icons that cannot be transparent
                <Input
                  id={backgroundId}
                  type="color"
                  value={background}
                  onChange={(event) => setBackground(event.target.value)}
                  className="h-10 w-16 p-1"
                />
              </label>
            </ToolOptions>
          )}
          <ToolField label="Icons">
            <div
              aria-live="polite"
              className="flex flex-col gap-4 rounded-2xl bg-card p-4"
            >
              {drawing && icons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Drawing the icons.
                </p>
              ) : icons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Pick at least one size to get an icon.
                </p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {icons.map((icon) => (
                    <li
                      key={icon.key}
                      className="flex flex-col items-center gap-2 rounded-xl bg-background p-4 text-center"
                    >
                      <img
                        src={icon.url}
                        alt={`${icon.name}, ${icon.size} pixels`}
                        width={icon.size}
                        height={icon.size}
                        className="h-auto max-w-full"
                      />
                      <span className="break-all text-sm font-medium">
                        {icon.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {icon.size} px, {formatBytes(icon.blob.size)}
                      </span>
                      <FileActions
                        file={() => ({ blob: icon.blob, name: icon.name })}
                        image
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ToolField>
          <ToolOptions className="justify-between">
            <p className="text-sm text-muted-foreground">
              A zip cannot go on the clipboard, so the whole set is download
              only. Every icon above copies on its own.
            </p>
            <Button
              type="button"
              variant="default"
              disabled={icons.length === 0}
              onClick={downloadZip}
            >
              <Download />
              Download all as a zip
            </Button>
          </ToolOptions>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}
