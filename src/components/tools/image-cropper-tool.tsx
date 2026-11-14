"use client";

import {
  type PointerEvent,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { ImageInput } from "~/components/tools/image-input";
import { FileActions, type OutputFile } from "~/components/tools/tool-actions";
import { Segmented, ToolField, ToolOptions } from "~/components/tools/tool-io";
import { Input } from "~/components/ui/input";
import { useImageFile } from "~/hooks/use-image-file";
import { canvasToBlob, ImageDecodeError, toCanvas } from "~/lib/image/canvas";
import {
  applyRatio,
  CROP_HANDLES,
  CROP_RATIOS,
  type CropBox,
  CropError,
  type CropHandle,
  type CropRatioName,
  clampBox,
  cropName,
  defaultBox,
  moveBox,
  ratioFor,
  resizeBox,
  scaleBox,
} from "~/utils/image-cropper";

type DragMode = "move" | CropHandle;

interface Drag {
  mode: DragMode;
  pointerX: number;
  pointerY: number;
  box: CropBox;
}

const HANDLE_STYLES: Record<CropHandle, string> = {
  nw: "left-0 top-0 cursor-nwse-resize",
  n: "left-1/2 top-0 cursor-ns-resize",
  ne: "left-full top-0 cursor-nesw-resize",
  e: "left-full top-1/2 cursor-ew-resize",
  se: "left-full top-full cursor-nwse-resize",
  s: "left-1/2 top-full cursor-ns-resize",
  sw: "left-0 top-full cursor-nesw-resize",
  w: "left-0 top-1/2 cursor-ew-resize",
};

interface NumberFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function NumberField({ label, value, min, max, onChange }: NumberFieldProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      {label}
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          const next = Number.parseInt(event.target.value, 10);
          onChange(Number.isNaN(next) ? min : next);
        }}
        className="h-10 w-24"
      />
    </label>
  );
}

export function ImageCropperTool() {
  const [file, setFile] = useState<File | null>(null);
  const [ratioName, setRatioName] = useState<CropRatioName>("free");
  const [draft, setDraft] = useState<CropBox | null>(null);
  const [displayWidth, setDisplayWidth] = useState(0);
  const [cropError, setCropError] = useState<string | null>(null);
  const drag = useRef<Drag | null>(null);

  const { bitmap, url, error: loadError } = useImageFile(file);
  const ratio = ratioFor(ratioName);

  const bounds = useMemo(
    () => (bitmap ? { width: bitmap.width, height: bitmap.height } : null),
    [bitmap],
  );

  const { box, boxError } = useMemo(() => {
    if (!bounds) {
      return { box: null, boxError: null as string | null };
    }

    try {
      return {
        box: clampBox(draft ?? defaultBox(bounds, ratio), bounds),
        boxError: null,
      };
    } catch (thrown) {
      if (thrown instanceof CropError) {
        return { box: null, boxError: thrown.message };
      }
      throw thrown;
    }
  }, [bounds, draft, ratio]);

  const scale = bitmap && displayWidth > 0 ? bitmap.width / displayWidth : 1;
  const displayBox = box && displayWidth > 0 ? scaleBox(box, 1 / scale) : null;

  const takeFile = useCallback((picked: File | null) => {
    setFile(picked);
    setDraft(null);
    setCropError(null);
  }, []);

  const pickRatio = useCallback(
    (name: CropRatioName) => {
      setRatioName(name);
      const next = ratioFor(name);
      if (box && bounds) {
        setDraft(applyRatio(box, next, bounds));
      }
    },
    [box, bounds],
  );

  const setField = useCallback(
    (field: keyof CropBox, value: number) => {
      if (!box || !bounds) {
        return;
      }

      if (field === "width" || field === "height") {
        const sized =
          field === "height" && ratio !== null
            ? { ...box, height: value, width: value * ratio }
            : { ...box, [field]: value };
        setDraft(applyRatio(sized, ratio, bounds));
        return;
      }

      setDraft(clampBox({ ...box, [field]: value }, bounds));
    },
    [box, bounds, ratio],
  );

  const startDrag = useCallback(
    (mode: DragMode) => (event: PointerEvent<HTMLElement>) => {
      if (!box) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = {
        mode,
        pointerX: event.clientX,
        pointerY: event.clientY,
        box,
      };
    },
    [box],
  );

  const moveDrag = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const active = drag.current;
      if (!active || !bounds) {
        return;
      }

      const dx = (event.clientX - active.pointerX) * scale;
      const dy = (event.clientY - active.pointerY) * scale;

      setDraft(
        active.mode === "move"
          ? moveBox(active.box, dx, dy, bounds)
          : resizeBox(active.box, active.mode, dx, dy, bounds, ratio),
      );
    },
    [bounds, ratio, scale],
  );

  const endDrag = useCallback((event: PointerEvent<HTMLElement>) => {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const measure = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return;
    }

    setDisplayWidth(node.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDisplayWidth(entry.contentRect.width);
      }
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const buildFile = useCallback(async (): Promise<OutputFile | null> => {
    if (!bitmap || !box || !file) {
      return null;
    }

    try {
      const cropped = await createImageBitmap(
        bitmap,
        box.x,
        box.y,
        box.width,
        box.height,
      );

      try {
        const blob = await canvasToBlob(toCanvas(cropped), "png");
        setCropError(null);
        return { blob, name: cropName(file.name, box) };
      } finally {
        cropped.close();
      }
    } catch (thrown) {
      setCropError(
        thrown instanceof ImageDecodeError
          ? thrown.message
          : "That crop could not be made from this image.",
      );
      return null;
    }
  }, [bitmap, box, file]);

  const problem = boxError ?? cropError;

  return (
    <div className="flex flex-col gap-5">
      <ImageInput
        preview={false}
        file={file}
        onFile={takeFile}
        url={url}
        error={loadError}
        hint="PNG, JPEG, WebP, GIF or SVG. It never leaves your browser."
      />
      {bitmap && (
        <>
          <ToolOptions>
            <Segmented
              label="Ratio"
              value={ratioName}
              options={CROP_RATIOS}
              onChange={pickRatio}
            />
          </ToolOptions>
          <ToolField label="Crop">
            <div className="rounded-2xl bg-card p-3 sm:p-4">
              <div
                ref={measure}
                className="relative mx-auto w-full max-w-xl select-none"
              >
                {url && (
                  <img
                    src={url}
                    alt={file ? file.name : "The image being cropped"}
                    draggable={false}
                    className="block h-auto w-full rounded-xl"
                  />
                )}
                {displayBox && (
                  <div aria-hidden="true" className="absolute inset-0">
                    <div
                      className="absolute left-0 right-0 top-0 bg-background/70"
                      style={{ height: displayBox.y }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-background/70"
                      style={{ top: displayBox.y + displayBox.height }}
                    />
                    <div
                      className="absolute left-0 bg-background/70"
                      style={{
                        top: displayBox.y,
                        height: displayBox.height,
                        width: displayBox.x,
                      }}
                    />
                    <div
                      className="absolute right-0 bg-background/70"
                      style={{
                        top: displayBox.y,
                        height: displayBox.height,
                        left: displayBox.x + displayBox.width,
                      }}
                    />
                    <div
                      role="presentation"
                      onPointerDown={startDrag("move")}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      className="absolute cursor-move touch-none ring-2 ring-primary ring-inset"
                      style={{
                        left: displayBox.x,
                        top: displayBox.y,
                        width: displayBox.width,
                        height: displayBox.height,
                      }}
                    >
                      {CROP_HANDLES.map((handle) => (
                        <div
                          key={handle}
                          role="presentation"
                          onPointerDown={startDrag(handle)}
                          onPointerMove={moveDrag}
                          onPointerUp={endDrag}
                          onPointerCancel={endDrag}
                          className={`absolute size-6 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full bg-primary sm:size-5 ${HANDLE_STYLES[handle]}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ToolField>
          {box && (
            <ToolOptions className="gap-x-5">
              <NumberField
                label="X"
                value={box.x}
                min={0}
                max={bitmap.width - 1}
                onChange={(value) => setField("x", value)}
              />
              <NumberField
                label="Y"
                value={box.y}
                min={0}
                max={bitmap.height - 1}
                onChange={(value) => setField("y", value)}
              />
              <NumberField
                label="Width"
                value={box.width}
                min={1}
                max={bitmap.width}
                onChange={(value) => setField("width", value)}
              />
              <NumberField
                label="Height"
                value={box.height}
                min={1}
                max={bitmap.height}
                onChange={(value) => setField("height", value)}
              />
            </ToolOptions>
          )}
          <ToolOptions className="justify-between">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {box
                ? `The crop is ${box.width} by ${box.height} pixels, saved as PNG.`
                : "Pick a crop to see its size."}
            </p>
            <FileActions file={buildFile} image disabled={!box} />
          </ToolOptions>
          {problem && <p className="text-sm text-destructive">{problem}</p>}
        </>
      )}
    </div>
  );
}
