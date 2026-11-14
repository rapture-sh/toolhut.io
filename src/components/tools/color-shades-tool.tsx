"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { FileActions } from "~/components/tools/tool-actions";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
  ToolOutput,
  ToolPanes,
} from "~/components/tools/tool-io";
import { Input } from "~/components/ui/input";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import {
  COLOR_FORMATS,
  type Color,
  type ColorFormat,
  ColorParseError,
  FORMAT_LABELS,
  formatColor,
  parseColor,
  toPickerHex,
} from "~/utils/color";
import { rampAsCss, ShadePrefixError, shadeRamp } from "~/utils/color-shades";

const DEFAULT_COLOR = "#7c5cff";

const DEFAULT_PREFIX = "color";

const FORMAT_OPTIONS = COLOR_FORMATS.map((format) => ({
  value: format,
  label: FORMAT_LABELS[format],
}));

interface Css {
  text: string;
  error: string | null;
}

function writeCss(
  ramp: ReturnType<typeof shadeRamp>,
  prefix: string,
  format: ColorFormat,
): Css {
  try {
    return { text: rampAsCss(ramp, { prefix, format }), error: null };
  } catch (thrown) {
    if (thrown instanceof ShadePrefixError) {
      return { text: "", error: thrown.message };
    }
    throw thrown;
  }
}

export function ColorShadesTool() {
  const [text, setText] = useState(DEFAULT_COLOR);
  const [color, setColor] = useState<Color>(() => parseColor(DEFAULT_COLOR));
  const [colorError, setColorError] = useState<string | null>(null);
  const [prefix, setPrefix] = useState(DEFAULT_PREFIX);
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const { copied, copy } = useCopyToClipboard();

  const change = (value: string) => {
    setText(value);

    try {
      setColor(parseColor(value));
      setColorError(null);
    } catch (thrown) {
      if (thrown instanceof ColorParseError) {
        setColorError(thrown.message);
        return;
      }
      throw thrown;
    }
  };

  const ramp = shadeRamp(color);
  const shades = ramp.map((shade) => ({
    step: shade.step,
    swatch: formatColor(shade.color, "hex"),
    value: formatColor(shade.color, format),
  }));
  const css = writeCss(ramp, prefix, format);

  const takeShade = (step: number, value: string) => {
    setCopiedStep(step);
    void copy(value);
  };

  return (
    <div className="flex flex-col gap-5">
      <ToolPanes>
        <div className="flex min-w-0 flex-col gap-2">
          <ToolField label="Colour">
            <div className="flex items-center gap-2">
              <Input
                value={text}
                onChange={(event) => change(event.target.value)}
                aria-label="Colour"
                aria-invalid={colorError !== null}
                spellCheck={false}
                placeholder={DEFAULT_COLOR}
                className="font-mono"
              />
              <input
                type="color"
                value={toPickerHex(color)}
                onChange={(event) => change(event.target.value)}
                aria-label="Pick a colour"
                className="h-11 w-14 shrink-0 cursor-pointer rounded-xl bg-muted p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              />
            </div>
          </ToolField>
          <p aria-live="polite" className="text-sm text-destructive">
            {colorError ?? ""}
          </p>
        </div>
        <ToolField label="Custom property prefix">
          <Input
            value={prefix}
            onChange={(event) => setPrefix(event.target.value)}
            aria-label="Custom property prefix"
            aria-invalid={css.error !== null}
            spellCheck={false}
            placeholder={DEFAULT_PREFIX}
            className="font-mono"
          />
        </ToolField>
      </ToolPanes>
      <ToolOptions>
        <Segmented
          label="Format"
          value={format}
          options={FORMAT_OPTIONS}
          onChange={setFormat}
        />
      </ToolOptions>
      <ToolField
        label="Shades"
        action={
          <CopyButton
            value={shades.map((shade) => shade.value).join("\n")}
            className="shrink-0"
          />
        }
      >
        <ul
          aria-live="polite"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {shades.map((shade) => (
            <li key={shade.step} className="flex">
              <button
                type="button"
                onClick={() => takeShade(shade.step, shade.value)}
                aria-label={`Copy ${shade.step}, ${shade.value}`}
                className="flex w-full min-w-0 flex-col gap-2 rounded-2xl bg-card p-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: shade.swatch }}
                  className="h-16 w-full rounded-xl ring-1 ring-border"
                />
                <span className="flex items-center justify-between gap-1 px-1">
                  <span className="text-xs font-medium">{shade.step}</span>
                  {copied && copiedStep === shade.step && (
                    <Check className="size-3 text-muted-foreground" />
                  )}
                </span>
                <span className="truncate px-1 pb-1 font-mono text-xs text-muted-foreground">
                  {shade.value}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </ToolField>
      <ToolField
        label="CSS custom properties"
        action={
          <FileActions
            file={() =>
              css.text === ""
                ? null
                : {
                    blob: new Blob([css.text], { type: "text/css" }),
                    name: "shades.css",
                  }
            }
            disabled={css.text === ""}
          />
        }
      >
        <ToolOutput
          value={css.text}
          error={css.error}
          className="h-64"
          placeholder="The ramp appears here as custom properties."
        />
      </ToolField>
    </div>
  );
}
