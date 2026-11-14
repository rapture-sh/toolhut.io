"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageInput } from "~/components/tools/image-input";
import { FileActions } from "~/components/tools/tool-actions";
import {
  Segmented,
  ToolField,
  ToolNumber,
  ToolOptions,
  ToolSlider,
} from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useImageFile } from "~/hooks/use-image-file";
import { canvasToBlob, resizeCanvas } from "~/lib/image/canvas";
import { formatBytes } from "~/utils/bytes";
import {
  formatForType,
  IMAGE_FORMAT_LIST,
  IMAGE_FORMATS,
  type ImageFormat,
  isLossy,
} from "~/utils/image-format";
import {
  fitToHeight,
  fitToWidth,
  pixelChange,
  ResizeError,
  type ResizeMode,
  resizedName,
  resolveSize,
  type Size,
  WIDTH_PRESETS,
} from "~/utils/image-resizer";

const MODES = [
  { value: "pixels" as const, label: "Pixels" },
  { value: "percent" as const, label: "Percent" },
];

const FORMATS = IMAGE_FORMAT_LIST.map((format) => ({
  value: format,
  label: IMAGE_FORMATS[format].label,
}));

interface Result {
  blob: Blob;
  url: string;
}

export function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const { bitmap, url, error: loadError } = useImageFile(file);

  const [mode, setMode] = useState<ResizeMode>("pixels");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [percent, setPercent] = useState(50);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [quality, setQuality] = useState(90);
  const [result, setResult] = useState<Result | null>(null);

  const source: Size | null = bitmap
    ? { width: bitmap.width, height: bitmap.height }
    : null;

  useEffect(() => {
    if (!bitmap) {
      return;
    }
    setWidth(bitmap.width);
    setHeight(bitmap.height);
  }, [bitmap]);

  useEffect(() => {
    if (file) {
      setFormat(formatForType(file.type) ?? "png");
    }
  }, [file]);

  const target = useMemo(() => {
    if (!source) {
      return { size: null, error: null };
    }

    try {
      return {
        size: resolveSize(source, { mode, width, height, lock, percent }),
        error: null,
      };
    } catch (error) {
      if (error instanceof ResizeError) {
        return { size: null, error: error.message };
      }
      throw error;
    }
  }, [source, mode, width, height, lock, percent]);

  const size = target.size;

  useEffect(() => {
    if (!bitmap || !size) {
      setResult(null);
      return;
    }

    let cancelled = false;
    let created: string | null = null;

    const timer = setTimeout(() => {
      resizeCanvas(bitmap, size.width, size.height)
        .then((canvas) => canvasToBlob(canvas, format, quality / 100))
        .then((blob) => {
          if (cancelled) {
            return;
          }
          created = URL.createObjectURL(blob);
          setResult({ blob, url: created });
        })
        .catch(() => {
          if (!cancelled) {
            setResult(null);
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (created) {
        URL.revokeObjectURL(created);
      }
    };
  }, [bitmap, size, format, quality]);

  const setWidthAndFollow = (value: number) => {
    setWidth(value);
    if (lock && source && value > 0) {
      setHeight(fitToWidth(source, value).height);
    }
  };

  const setHeightAndFollow = (value: number) => {
    setHeight(value);
    if (lock && source && value > 0) {
      setWidth(fitToHeight(source, value).width);
    }
  };

  const change = source && size ? pixelChange(source, size) : 0;

  return (
    <div className="flex flex-col gap-5">
      <ImageInput
        file={file}
        onFile={setFile}
        url={url}
        error={loadError}
        hint="PNG, JPEG, WebP, GIF, AVIF or SVG. It never leaves your browser."
      />
      {source && (
        <>
          <ToolOptions>
            <Segmented
              label="Resize by"
              value={mode}
              options={MODES}
              onChange={setMode}
            />
            <Segmented
              label="Save as"
              value={format}
              options={FORMATS}
              onChange={setFormat}
            />
          </ToolOptions>
          {mode === "pixels" ? (
            <div className="flex flex-col gap-4 rounded-2xl bg-card p-4">
              <div className="flex flex-wrap items-end gap-4">
                <ToolNumber
                  label="Width"
                  value={width}
                  onChange={setWidthAndFollow}
                  suffix="px"
                />
                <ToolNumber
                  label="Height"
                  value={height}
                  onChange={setHeightAndFollow}
                  suffix="px"
                />
                <label
                  htmlFor="image-resizer-lock"
                  className="flex h-11 cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    id="image-resizer-lock"
                    checked={lock}
                    onCheckedChange={(next) => setLock(next === true)}
                  />
                  Keep the proportions
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Common widths
                </span>
                {WIDTH_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setMode("pixels");
                      setWidthAndFollow(preset);
                    }}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-card p-4">
              <ToolSlider
                label="Scale"
                value={percent}
                min={1}
                max={200}
                display={`${percent}%`}
                onChange={setPercent}
              />
            </div>
          )}
          {isLossy(format) && (
            <div className="rounded-2xl bg-card p-4">
              <ToolSlider
                label="Quality"
                value={quality}
                min={30}
                max={100}
                display={`${quality}%`}
                onChange={setQuality}
              />
            </div>
          )}
          <ToolField
            label="Result"
            action={
              <FileActions
                image
                disabled={!result}
                file={() =>
                  result && size && file
                    ? {
                        blob: result.blob,
                        name: resizedName(file.name, size, format),
                      }
                    : null
                }
              />
            }
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6">
              {target.error ? (
                <p className="text-sm text-destructive">{target.error}</p>
              ) : result && size ? (
                <>
                  <img
                    src={result.url}
                    alt="The result at its new size"
                    width={size.width}
                    height={size.height}
                    className="max-h-80 w-auto max-w-full rounded-xl object-contain"
                  />
                  <p
                    aria-live="polite"
                    className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-sm text-muted-foreground tabular-nums"
                  >
                    <span>
                      {source.width} x {source.height}
                    </span>
                    <span aria-hidden="true">to</span>
                    <span className="text-foreground">
                      {size.width} x {size.height}
                    </span>
                    <span>{formatBytes(result.blob.size)}</span>
                    {change !== 0 && (
                      <span>
                        {change < 0
                          ? `${Math.abs(change)}% fewer pixels`
                          : `${change}% more pixels`}
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Working out the new image.
                </p>
              )}
            </div>
          </ToolField>
        </>
      )}
    </div>
  );
}
