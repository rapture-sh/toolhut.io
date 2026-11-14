"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImageInput } from "~/components/tools/image-input";
import { FileActions } from "~/components/tools/tool-actions";
import {
  Segmented,
  ToolField,
  ToolOptions,
  ToolPanes,
  ToolSlider,
} from "~/components/tools/tool-io";
import { useImageFile } from "~/hooks/use-image-file";
import {
  canvasToBlob,
  ImageDecodeError,
  readPixels,
  toCanvas,
} from "~/lib/image/canvas";
import { formatBytes } from "~/utils/bytes";
import {
  ConversionError,
  type ConversionPlan,
  conversionPlan,
  isHexColour,
  needsBackground,
  targetFormats,
} from "~/utils/image-converter";
import {
  formatForType,
  IMAGE_FORMATS,
  type ImageFormat,
  isLossy,
} from "~/utils/image-format";

interface Result {
  blob: Blob;
  url: string;
}

function hasAlpha(bitmap: ImageBitmap): boolean {
  const { data } = readPixels(bitmap);

  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 255) {
      return true;
    }
  }

  return false;
}

export function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<ImageFormat>("webp");
  const [quality, setQuality] = useState(0.9);
  const [background, setBackground] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { bitmap, url, error: loadError } = useImageFile(file);
  const shown = useRef<string | null>(null);

  const source = file ? formatForType(file.type) : undefined;
  const targets = useMemo(() => targetFormats(source), [source]);

  useEffect(() => {
    return () => {
      if (shown.current) {
        URL.revokeObjectURL(shown.current);
      }
    };
  }, []);

  useEffect(() => {
    setTarget((current) =>
      targets.includes(current) ? current : (targets[0] ?? "png"),
    );
  }, [targets]);

  useEffect(() => {
    if (!bitmap) {
      setTransparent(false);
      return;
    }

    try {
      setTransparent(hasAlpha(bitmap));
    } catch {
      setTransparent(false);
    }
  }, [bitmap]);

  const plan = useMemo((): {
    plan: ConversionPlan | null;
    error: string | null;
  } => {
    if (!file) {
      return { plan: null, error: null };
    }

    try {
      return {
        plan: conversionPlan({
          name: file.name,
          source,
          target,
          quality,
          transparent,
          background,
        }),
        error: null,
      };
    } catch (thrown) {
      if (thrown instanceof ConversionError) {
        return { plan: null, error: thrown.message };
      }
      throw thrown;
    }
  }, [file, source, target, quality, transparent, background]);

  const ready = plan.plan;

  useEffect(() => {
    if (!bitmap || !ready) {
      setResult(null);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      const run = async () => {
        try {
          const canvas = toCanvas(
            bitmap,
            bitmap.width,
            bitmap.height,
            ready.background,
          );
          const blob = await canvasToBlob(canvas, ready.format, ready.quality);

          if (cancelled) {
            return;
          }

          const next = URL.createObjectURL(blob);
          if (shown.current) {
            URL.revokeObjectURL(shown.current);
          }
          shown.current = next;
          setResult({ blob, url: next });
          setError(null);
        } catch (thrown) {
          if (cancelled) {
            return;
          }
          setResult(null);
          setError(
            thrown instanceof ImageDecodeError
              ? thrown.message
              : "This browser could not write that format.",
          );
        }
      };

      void run();
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bitmap, ready]);

  const showBackground = needsBackground(target) && transparent;

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="Convert to"
          value={target}
          options={targets.map((format) => ({
            value: format,
            label: IMAGE_FORMATS[format].label,
          }))}
          onChange={setTarget}
        />
        {isLossy(target) && (
          <ToolSlider
            label="Quality"
            value={quality}
            min={0.3}
            max={1}
            step={0.01}
            display={`${Math.round(quality * 100)}%`}
            onChange={setQuality}
          />
        )}
      </ToolOptions>
      {showBackground && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-card p-4">
          <label
            htmlFor="image-converter-background"
            className="text-sm font-medium"
          >
            Behind the transparency
          </label>
          <input
            id="image-converter-background"
            type="color"
            value={isHexColour(background) ? background : "#ffffff"}
            onChange={(event) => setBackground(event.target.value)}
            className="size-11 cursor-pointer rounded-xl bg-muted p-1"
          />
          <input
            aria-label="Background colour as hex"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
            aria-invalid={!isHexColour(background)}
            spellCheck={false}
            className="h-11 w-28 rounded-xl bg-muted px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60 aria-invalid:ring-2 aria-invalid:ring-destructive/50"
          />
          <span className="text-sm text-muted-foreground">
            JPEG holds no transparency, so this colour goes behind the image.
          </span>
        </div>
      )}
      <ToolPanes>
        <ToolField
          label={
            source ? `Original, ${IMAGE_FORMATS[source].label}` : "Original"
          }
        >
          <ImageInput
            file={file}
            onFile={setFile}
            url={url}
            error={loadError}
            hint="PNG, JPEG, WebP, GIF, AVIF or SVG in. It never leaves your browser."
          />
        </ToolField>
        <ToolField
          label={`Converted, ${IMAGE_FORMATS[target].label}`}
          action={
            <FileActions
              image
              disabled={!result}
              file={() =>
                result && ready ? { blob: result.blob, name: ready.name } : null
              }
            />
          }
        >
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl bg-card p-6">
            {plan.error || error ? (
              <p className="text-sm text-destructive">{plan.error ?? error}</p>
            ) : result && file ? (
              <>
                <img
                  src={result.url}
                  alt="The converted copy"
                  className="max-h-80 w-auto max-w-full rounded-xl object-contain"
                />
                <p
                  aria-live="polite"
                  className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-sm text-muted-foreground tabular-nums"
                >
                  <span>{formatBytes(file.size)}</span>
                  <span aria-hidden="true">to</span>
                  <span className="text-foreground">
                    {formatBytes(result.blob.size)}
                  </span>
                  <span>{ready?.name}</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {file
                  ? "Working out the converted copy."
                  : "Drop an image to convert it."}
              </p>
            )}
          </div>
        </ToolField>
      </ToolPanes>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The conversion is a decode and a re-encode by your own browser, so
        nothing is uploaded. PNG and WebP keep transparency, JPEG does not, and
        an animated GIF comes out as its first frame. AVIF is not offered
        because no browser can write it.
      </p>
    </div>
  );
}
