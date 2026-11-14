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
import { canvasToBlob, ImageDecodeError, toCanvas } from "~/lib/image/canvas";
import { formatBytes } from "~/utils/bytes";
import {
  CompressionInputError,
  clampQuality,
  compressedName,
  QUALITY_RANGE,
  qualityPercent,
  savings,
} from "~/utils/image-compressor";
import { IMAGE_FORMATS, type ImageFormat, isLossy } from "~/utils/image-format";

const FORMATS = [
  { value: "jpeg" as const, label: IMAGE_FORMATS.jpeg.label },
  { value: "webp" as const, label: IMAGE_FORMATS.webp.label },
  { value: "png" as const, label: IMAGE_FORMATS.png.label },
];

/** JPEG has no alpha, so a transparent PNG would come out with black holes. */
const FLATTEN = "#ffffff";

interface Result {
  blob: Blob;
  url: string;
}

export function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [quality, setQuality] = useState(0.8);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { bitmap, url, error: loadError } = useImageFile(file);
  const shown = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (shown.current) {
        URL.revokeObjectURL(shown.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!bitmap) {
      setResult(null);
      setError(null);
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
            format === "jpeg" ? FLATTEN : undefined,
          );
          const blob = await canvasToBlob(canvas, format, quality);

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
  }, [bitmap, format, quality]);

  const difference = useMemo(() => {
    if (!file || !result) {
      return null;
    }

    try {
      return savings(file.size, result.blob.size);
    } catch (thrown) {
      if (thrown instanceof CompressionInputError) {
        return null;
      }
      throw thrown;
    }
  }, [file, result]);

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="Save as"
          value={format}
          options={FORMATS}
          onChange={setFormat}
        />
        {isLossy(format) && (
          <ToolSlider
            label="Quality"
            value={quality}
            min={QUALITY_RANGE.min}
            max={QUALITY_RANGE.max}
            step={QUALITY_RANGE.step}
            display={`${qualityPercent(quality)}%`}
            onChange={(value) => setQuality(clampQuality(value))}
          />
        )}
      </ToolOptions>
      <ToolPanes>
        <ToolField label="Original">
          <ImageInput
            file={file}
            onFile={setFile}
            url={url}
            error={loadError}
            hint="PNG, JPEG, WebP or SVG. It never leaves your browser."
          />
        </ToolField>
        <ToolField
          label="Compressed"
          action={
            <FileActions
              image
              disabled={!result}
              file={() =>
                result && file
                  ? {
                      blob: result.blob,
                      name: compressedName(file.name, format),
                    }
                  : null
              }
            />
          }
        >
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-2xl bg-card p-6">
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : result && file ? (
              <>
                <img
                  src={result.url}
                  alt="The smaller copy"
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
                  {difference && <span>{difference.label}</span>}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {file
                  ? "Working out the smaller copy."
                  : "Drop an image to see how small it gets."}
              </p>
            )}
          </div>
        </ToolField>
      </ToolPanes>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The smaller copy is written by your browser's own image encoder, in this
        tab. JPEG and WebP drop detail to save bytes, so drag the quality down
        until the preview still looks right. PNG keeps every pixel and only wins
        on flat graphics, and a transparent image saved as JPEG gets white
        behind it.
      </p>
    </div>
  );
}
