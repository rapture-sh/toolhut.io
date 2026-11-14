"use client";

import { Pipette } from "lucide-react";
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
import {
  canvasToBlob,
  ImageDecodeError,
  readPixels,
  resizeCanvas,
} from "~/lib/image/canvas";
import { cn } from "~/lib/utils";
import { formatBytes } from "~/utils/bytes";
import {
  IMAGE_FORMAT_LIST,
  IMAGE_FORMATS,
  type ImageFormat,
  isLossy,
} from "~/utils/image-format";
import {
  ANCHOR_ROWS,
  type Anchor,
  type Box,
  edgeColor,
  innerSize,
  LogoPaddingError,
  MAX_PADDING_PERCENT,
  MIN_SIZE_PERCENT,
  paddedName,
  placeLogo,
  type Size,
  SQUARE_PRESETS,
  squareFor,
} from "~/utils/logo-padding";

type Fill = "color" | "transparent";

const FILLS = [
  { value: "color" as const, label: "Colour" },
  { value: "transparent" as const, label: "Transparent" },
];

const FORMATS = IMAGE_FORMAT_LIST.map((format) => ({
  value: format,
  label: IMAGE_FORMATS[format].label,
}));

/** JPEG has no alpha channel, so transparent padding has to become a colour. */
const KEEPS_ALPHA: Record<ImageFormat, boolean> = {
  png: true,
  jpeg: false,
  webp: true,
};

const ANCHOR_LABELS: Record<Anchor, string> = {
  "top-left": "Top left",
  top: "Top",
  "top-right": "Top right",
  left: "Left",
  center: "Centre",
  right: "Right",
  "bottom-left": "Bottom left",
  bottom: "Bottom",
  "bottom-right": "Bottom right",
};

interface Result {
  blob: Blob;
  url: string;
}

async function renderPadded(
  bitmap: ImageBitmap,
  canvasSize: Size,
  box: Box,
  background: string | null,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize.width;
  canvas.height = canvasSize.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new ImageDecodeError("This browser cannot draw on a canvas.");
  }

  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const shrinking = box.width < bitmap.width;
  const source = shrinking
    ? await resizeCanvas(bitmap, box.width, box.height)
    : bitmap;

  context.drawImage(source, box.x, box.y, box.width, box.height);

  return canvas;
}

export function LogoPaddingTool() {
  const [file, setFile] = useState<File | null>(null);
  const { bitmap, url, error: loadError } = useImageFile(file);

  const [square, setSquare] = useState(true);
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [padding, setPadding] = useState(15);
  const [anchor, setAnchor] = useState<Anchor>("center");
  const [size, setSize] = useState(85);
  const [fill, setFill] = useState<Fill>("color");
  const [background, setBackground] = useState("#ffffff");
  const [format, setFormat] = useState<ImageFormat>("png");
  const [quality, setQuality] = useState(92);
  const [result, setResult] = useState<Result | null>(null);

  const source: Size | null = bitmap
    ? { width: bitmap.width, height: bitmap.height }
    : null;

  useEffect(() => {
    if (!bitmap) {
      return;
    }
    const side = Math.max(
      squareFor({ width: bitmap.width, height: bitmap.height }),
      256,
    );
    setWidth(side);
    setHeight(side);
    const found = edgeColor(readPixels(bitmap, 64));
    if (found) {
      setBackground(found);
      setFill("color");
    } else {
      setFill("transparent");
    }
  }, [bitmap]);

  const canvasSize = useMemo<Size>(
    () => ({
      width: Math.round(width),
      height: Math.round(square ? width : height),
    }),
    [width, height, square],
  );

  const placement = useMemo(() => {
    if (!source) {
      return { box: null, error: null };
    }

    try {
      return {
        box: placeLogo(source, canvasSize, {
          paddingPercent: padding,
          anchor,
          sizePercent: size,
        }),
        error: null,
      };
    } catch (error) {
      if (error instanceof LogoPaddingError) {
        return { box: null, error: error.message };
      }
      throw error;
    }
  }, [source, canvasSize, padding, anchor, size]);

  const box = placement.box;
  const inner = source ? innerSize(canvasSize, padding) : null;
  // A logo that fills the space has nowhere to be moved to.
  const movable =
    box !== null &&
    inner !== null &&
    (box.width < inner.width || box.height < inner.height);
  const keepsAlpha = fill === "transparent" && KEEPS_ALPHA[format];
  const paint = keepsAlpha
    ? null
    : fill === "transparent"
      ? "#ffffff"
      : background;

  useEffect(() => {
    if (!bitmap || !box) {
      setResult(null);
      return;
    }

    let cancelled = false;
    let created: string | null = null;

    const timer = setTimeout(() => {
      renderPadded(bitmap, canvasSize, box, paint)
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
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (created) {
        URL.revokeObjectURL(created);
      }
    };
  }, [bitmap, box, canvasSize, paint, format, quality]);

  const pickFromLogo = () => {
    if (!bitmap) {
      return;
    }
    const found = edgeColor(readPixels(bitmap, 64));
    if (found) {
      setBackground(found);
      setFill("color");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {!source ? (
        <ImageInput
          file={file}
          onFile={setFile}
          url={url}
          error={loadError}
          hint="PNG, JPEG, WebP or SVG. It never leaves your browser."
        />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-5">
            <ImageInput
              preview={false}
              file={file}
              onFile={setFile}
              url={url}
              error={loadError}
            />
            <div className="flex flex-col gap-5 rounded-2xl bg-card p-4">
              <div className="flex flex-wrap items-end gap-4">
                <ToolNumber
                  label="Canvas width"
                  value={canvasSize.width}
                  onChange={setWidth}
                  min={1}
                  suffix="px"
                />
                <ToolNumber
                  label="Canvas height"
                  value={canvasSize.height}
                  onChange={setHeight}
                  min={1}
                  suffix="px"
                  className={cn(square && "opacity-50")}
                />
                <label
                  htmlFor="logo-padding-square"
                  className="flex h-11 cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    id="logo-padding-square"
                    checked={square}
                    onCheckedChange={(next) => setSquare(next === true)}
                  />
                  Square
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Common sizes
                </span>
                {SQUARE_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSquare(true);
                      setWidth(preset);
                      setHeight(preset);
                    }}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              <ToolSlider
                label="Padding"
                value={padding}
                min={0}
                max={MAX_PADDING_PERCENT}
                display={`${padding}%`}
                onChange={setPadding}
              />
              <ToolSlider
                label="Logo size"
                value={size}
                min={MIN_SIZE_PERCENT}
                max={100}
                display={`${size}%`}
                onChange={setSize}
              />
            </div>
            <div className="flex flex-wrap gap-5">
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">Position</legend>
                {!movable && (
                  <p className="max-w-44 text-xs leading-relaxed text-muted-foreground">
                    The logo fills the space, so there is nowhere to move it.
                    Lower the logo size.
                  </p>
                )}
                <div className="grid w-fit grid-cols-3 gap-1 rounded-2xl bg-card p-2">
                  {ANCHOR_ROWS.flat().map((option) => (
                    <Button
                      key={option}
                      type="button"
                      size="icon-sm"
                      variant={option === anchor ? "default" : "ghost"}
                      aria-pressed={option === anchor}
                      aria-label={ANCHOR_LABELS[option]}
                      onClick={() => setAnchor(option)}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 rounded-full",
                          option === anchor
                            ? "bg-primary-foreground"
                            : "bg-muted-foreground",
                        )}
                      />
                    </Button>
                  ))}
                </div>
              </fieldset>
              <div className="flex min-w-60 flex-1 flex-col gap-3">
                <Segmented
                  label="Background"
                  value={fill}
                  options={FILLS}
                  onChange={setFill}
                />
                {fill === "color" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="logo-padding-background"
                      className="text-sm font-medium"
                    >
                      Colour
                    </label>
                    <input
                      id="logo-padding-background"
                      type="color"
                      value={background}
                      onChange={(event) => setBackground(event.target.value)}
                      className="size-11 cursor-pointer rounded-xl bg-muted p-1"
                    />
                    <input
                      aria-label="Background colour as hex"
                      value={background}
                      onChange={(event) => setBackground(event.target.value)}
                      spellCheck={false}
                      className="h-11 w-28 rounded-xl bg-muted px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={pickFromLogo}
                    >
                      <Pipette />
                      From the logo
                    </Button>
                  </div>
                )}
                {fill === "transparent" && !KEEPS_ALPHA[format] && (
                  <p className="text-sm text-muted-foreground">
                    {IMAGE_FORMATS[format].label} has no transparency, so the
                    padding is filled with white.
                  </p>
                )}
              </div>
            </div>
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
                  min={40}
                  max={100}
                  display={`${quality}%`}
                  onChange={setQuality}
                />
              )}
            </ToolOptions>
          </div>
          <div className="lg:sticky lg:top-6">
            <ToolField
              label="Result"
              action={
                <FileActions
                  image
                  disabled={!result}
                  file={() =>
                    result && file
                      ? {
                          blob: result.blob,
                          name: paddedName(file.name, canvasSize, format),
                        }
                      : null
                  }
                />
              }
            >
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6">
                {placement.error ? (
                  <p className="text-sm text-destructive">{placement.error}</p>
                ) : result ? (
                  <>
                    <img
                      src={result.url}
                      alt="The logo on its new canvas"
                      width={canvasSize.width}
                      height={canvasSize.height}
                      className="max-h-96 w-auto max-w-full rounded-xl bg-muted object-contain"
                    />
                    <p
                      aria-live="polite"
                      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-sm text-muted-foreground tabular-nums"
                    >
                      <span className="text-foreground">
                        {canvasSize.width} x {canvasSize.height}
                      </span>
                      {box && (
                        <span>
                          logo {box.width} x {box.height}
                        </span>
                      )}
                      <span>{formatBytes(result.blob.size)}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Drawing the new canvas.
                  </p>
                )}
              </div>
            </ToolField>
          </div>
        </div>
      )}
    </div>
  );
}
