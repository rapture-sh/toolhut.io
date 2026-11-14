"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CodeView } from "~/components/tools/code-view";
import { FileActions } from "~/components/tools/tool-actions";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { Checkbox } from "~/components/ui/checkbox";
import { optimizeSvg } from "~/lib/svg/optimize";
import { formatBytes } from "~/utils/bytes";
import {
  SvgError,
  savings,
  svgByteSize,
  svgDimensions,
} from "~/utils/svg-optimizer";

type Precision = "1" | "2" | "3";

const PRECISIONS = [
  { value: "1" as const, label: "1" },
  { value: "2" as const, label: "2" },
  { value: "3" as const, label: "3" },
];

const PLACEHOLDER = "Paste SVG markup here, or drop an .svg file";

export function SvgOptimizerTool() {
  const keepId = useId();
  const [markup, setMarkup] = useState("");
  const [precision, setPrecision] = useState<Precision>("2");
  const [keepDimensions, setKeepDimensions] = useState(false);
  const [optimized, setOptimized] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (markup.trim() === "") {
      setOptimized("");
      setError(null);
      return;
    }

    let cancelled = false;

    // Waits for a pause in typing, because svgo parses the whole document.
    const timer = setTimeout(() => {
      optimizeSvg(markup, {
        precision: Number(precision),
        keepDimensions,
      })
        .then((data) => {
          if (!cancelled) {
            setOptimized(data);
            setError(null);
          }
        })
        .catch((thrown: unknown) => {
          if (!cancelled) {
            setOptimized("");
            setError(
              thrown instanceof SvgError
                ? thrown.message
                : "That SVG could not be optimized.",
            );
          }
        });
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [markup, precision, keepDimensions]);

  const before = svgByteSize(markup);
  const after = svgByteSize(optimized);
  const saved = useMemo(
    () => (optimized === "" ? null : savings(before, after)),
    [before, after, optimized],
  );

  const size = useMemo(() => {
    if (optimized === "") {
      return null;
    }

    try {
      return svgDimensions(optimized);
    } catch {
      return null;
    }
  }, [optimized]);

  const preview =
    optimized === ""
      ? null
      : `data:image/svg+xml;utf8,${encodeURIComponent(optimized)}`;

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions className="gap-x-5">
        <span className="text-sm text-muted-foreground">Decimal places</span>
        <Segmented
          label="Decimal places kept on coordinates"
          value={precision}
          options={PRECISIONS}
          onChange={setPrecision}
        />
        <label
          htmlFor={keepId}
          className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground"
        >
          <Checkbox
            id={keepId}
            checked={keepDimensions}
            onCheckedChange={(checked) => setKeepDimensions(checked === true)}
          />
          Keep width and height
        </label>
      </ToolOptions>
      <ToolPanes>
        <ToolField label="SVG">
          <ToolTextarea
            value={markup}
            onChange={setMarkup}
            placeholder={PLACEHOLDER}
            pasteFiles
          />
        </ToolField>
        <ToolField label="Optimized" action={<CopyButton value={optimized} />}>
          <CodeView
            value={optimized}
            error={error}
            placeholder="The optimized markup appears here."
            language="xml"
          />
        </ToolField>
      </ToolPanes>
      <ToolOptions className="justify-between">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {saved
            ? `${formatBytes(before)} down to ${formatBytes(after)}, ${saved.percent} per cent smaller.`
            : "Paste an SVG to see what it saves."}
        </p>
        <FileActions
          file={() => ({
            blob: new Blob([optimized], { type: "image/svg+xml" }),
            name: "optimized.svg",
          })}
          disabled={optimized === ""}
        />
      </ToolOptions>
      {preview && (
        <ToolField label="Preview">
          <div className="flex min-h-48 items-center justify-center rounded-2xl bg-card p-6">
            <img
              src={preview}
              alt="The optimized SVG, rendered"
              className="max-h-64 w-auto max-w-full"
            />
          </div>
          {size?.width && size.height && (
            <p className="text-sm text-muted-foreground">
              {size.width} by {size.height} pixels
              {size.fromViewBox ? ", from the viewBox" : ""}.
            </p>
          )}
        </ToolField>
      )}
    </div>
  );
}
