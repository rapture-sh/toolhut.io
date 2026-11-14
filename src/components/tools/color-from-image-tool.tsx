"use client";

import { Pipette, X } from "lucide-react";
import {
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { DropZone } from "~/components/tools/drop-zone";
import { ImageInput } from "~/components/tools/image-input";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
} from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { useImageFile } from "~/hooks/use-image-file";
import { type Pixels, readPixels } from "~/lib/image/canvas";
import { isImageFile } from "~/lib/read-file";
import {
  COLOR_FORMATS,
  type Color,
  type ColorFormat,
  FORMAT_LABELS,
  formatColor,
  parseColor,
  toPickerHex,
} from "~/utils/color";
import {
  extractPalette,
  type PaletteColor,
  PaletteError,
  pixelAt,
} from "~/utils/color-from-image";

const FORMAT_OPTIONS = COLOR_FORMATS.map((format) => ({
  value: format,
  label: FORMAT_LABELS[format],
}));

const PALETTE_SIZE = 6;

/** Enough pixels to sample from accurately, few enough to read back quickly. */
const SAMPLE_SIDE = 1024;

/** The palette only needs colour, so it reads a small copy of the image. */
const PALETTE_SIDE = 192;

interface Sampled {
  color: Color;
  /** Null when the colour came from the picker rather than the picture. */
  x: number | null;
  y: number | null;
}

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperSession {
  open: () => Promise<EyeDropperResult>;
}

type EyeDropperApi = new () => EyeDropperSession;

/** Chrome and Edge have this, Firefox and Safari do not. */
function eyeDropperApi(): EyeDropperApi | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    (window as unknown as { EyeDropper?: EyeDropperApi }).EyeDropper ?? null
  );
}

export function ColorFromImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const { bitmap, url, error } = useImageFile(file);
  const [sample, setSample] = useState<Pixels | null>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [paletteError, setPaletteError] = useState<string | null>(null);
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [picked, setPicked] = useState<Sampled | null>(null);
  const [hover, setHover] = useState<Sampled | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const replace = useRef<HTMLInputElement>(null);
  const { copied, copy } = useCopyToClipboard();

  useEffect(() => {
    setHasEyeDropper(eyeDropperApi() !== null);
  }, []);

  useEffect(() => {
    setPicked(null);
    setHover(null);

    if (!bitmap) {
      setSample(null);
      setPalette([]);
      setPaletteError(null);
      return;
    }

    setSample(readPixels(bitmap, SAMPLE_SIDE));

    try {
      setPalette(
        extractPalette(readPixels(bitmap, PALETTE_SIDE), {
          count: PALETTE_SIZE,
        }),
      );
      setPaletteError(null);
    } catch (thrown) {
      if (thrown instanceof PaletteError) {
        setPalette([]);
        setPaletteError(thrown.message);
        return;
      }
      throw thrown;
    }
  }, [bitmap]);

  useEffect(() => {
    const target = canvas.current;

    if (!target || !bitmap || !sample) {
      return;
    }

    target.width = sample.width;
    target.height = sample.height;

    const context = target.getContext("2d");
    if (context) {
      context.drawImage(bitmap, 0, 0, sample.width, sample.height);
    }
  }, [bitmap, sample]);

  const take = (files: File[]) => {
    const image = files.find(isImageFile);
    if (image) {
      setFile(image);
    }
  };

  const locate = (
    event: PointerEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>,
  ): Sampled | null => {
    const rect = event.currentTarget.getBoundingClientRect();

    if (!sample || rect.width === 0 || rect.height === 0) {
      return null;
    }

    const x = ((event.clientX - rect.left) / rect.width) * sample.width;
    const y = ((event.clientY - rect.top) / rect.height) * sample.height;
    const color = pixelAt(sample, x, y);

    return color ? { color, x: Math.floor(x), y: Math.floor(y) } : null;
  };

  const pickFromScreen = async () => {
    const Dropper = eyeDropperApi();

    if (!Dropper) {
      return;
    }

    try {
      const result = await new Dropper().open();
      setPicked({ color: parseColor(result.sRGBHex), x: null, y: null });
    } catch {
      // The eyedropper rejects when the user presses Escape, which is a
      // cancel rather than a failure.
    }
  };

  const takeValue = (value: string) => {
    setCopiedValue(value);
    void copy(value);
  };

  const current = hover ?? picked;
  const value = current ? formatColor(current.color, format) : "";
  const pickerValue = current ? toPickerHex(current.color) : "#ffffff";

  return (
    <div className="flex flex-col gap-5">
      {bitmap && sample ? (
        <DropZone onFiles={take} label="Drop another image here" paste>
          <div className="flex w-full flex-col items-center gap-3 rounded-2xl bg-card p-3">
            <canvas
              ref={canvas}
              onPointerMove={(event) => setHover(locate(event))}
              onPointerLeave={() => setHover(null)}
              onClick={(event) => {
                const spot = locate(event);
                if (spot) {
                  setPicked(spot);
                }
              }}
              aria-label="Click the picture to sample the colour of a pixel"
              className="max-h-[32rem] w-auto max-w-full cursor-crosshair rounded-xl"
            />
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="max-w-60 truncate font-medium text-foreground">
                {file?.name}
              </span>
              <input
                ref={replace}
                type="file"
                accept="image/*"
                aria-label="Choose another image"
                className="sr-only"
                onChange={(event) => {
                  const chosen = event.target.files?.[0];
                  if (chosen) {
                    setFile(chosen);
                  }
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => replace.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove the image"
                onClick={() => setFile(null)}
              >
                <X />
              </Button>
            </div>
          </div>
        </DropZone>
      ) : (
        <ImageInput
          file={file}
          onFile={setFile}
          url={url}
          error={error}
          hint="PNG, JPEG, WebP, GIF, AVIF or SVG. It never leaves your browser."
        />
      )}
      {bitmap && sample && (
        <>
          <ToolOptions>
            <Segmented
              label="Format"
              value={format}
              options={FORMAT_OPTIONS}
              onChange={setFormat}
            />
            <input
              type="color"
              value={pickerValue}
              onChange={(event) =>
                setPicked({
                  color: parseColor(event.target.value),
                  x: null,
                  y: null,
                })
              }
              aria-label="Pick a colour by hand"
              className="h-11 w-14 shrink-0 cursor-pointer rounded-xl bg-muted p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
            {hasEyeDropper && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void pickFromScreen()}
              >
                <Pipette />
                Pick from the screen
              </Button>
            )}
          </ToolOptions>
          <ToolField
            label="Sampled colour"
            action={<CopyButton value={value} />}
          >
            <p
              aria-live="polite"
              className="flex min-h-14 flex-wrap items-center gap-3 rounded-2xl bg-card px-4 py-3 text-sm"
            >
              {current ? (
                <>
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: toPickerHex(current.color) }}
                    className="size-8 shrink-0 rounded-full ring-1 ring-border"
                  />
                  <span className="font-mono">{value}</span>
                  <span className="text-muted-foreground">
                    {current.x === null || current.y === null
                      ? "picked by hand"
                      : `at ${current.x}, ${current.y}`}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  Move over the picture to read a pixel, click to keep it.
                </span>
              )}
            </p>
          </ToolField>
          <ToolField label="Palette">
            {paletteError ? (
              <p className="text-sm text-destructive">{paletteError}</p>
            ) : (
              <ul
                aria-live="polite"
                className="grid grid-cols-3 gap-3 sm:grid-cols-6"
              >
                {palette.map((entry, index) => {
                  const swatch = toPickerHex(entry.color);
                  const entryValue = formatColor(entry.color, format);
                  return (
                    <li key={`${index}-${swatch}`} className="flex">
                      <button
                        type="button"
                        onClick={() => takeValue(entryValue)}
                        aria-label={`Copy ${entryValue}`}
                        className="flex w-full min-w-0 flex-col gap-2 rounded-2xl bg-card p-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                      >
                        <span
                          aria-hidden="true"
                          style={{ backgroundColor: swatch }}
                          className="h-16 w-full rounded-xl ring-1 ring-border"
                        />
                        <span className="truncate px-1 font-mono text-xs">
                          {entryValue}
                        </span>
                        <span className="px-1 pb-1 text-xs text-muted-foreground">
                          {copied && copiedValue === entryValue
                            ? "Copied"
                            : `${Math.round(entry.share * 100)}%`}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </ToolField>
        </>
      )}
    </div>
  );
}
