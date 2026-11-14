"use client";

import { useState } from "react";
import { CopyButton, ToolField, ToolPanes } from "~/components/tools/tool-io";
import { Input } from "~/components/ui/input";
import { ColorParseError, formatColor, toPickerHex } from "~/utils/color";
import { type Conversion, convertColor } from "~/utils/color-converter";

const DEFAULT_COLOR = "#7c5cff";

const HINT = "Try a hex, rgb(), hsl(), oklch() or a CSS colour name.";

interface Reading {
  conversions: Conversion[];
  swatch: string;
  picker: string;
}

function read(input: string): Reading {
  const { color, conversions } = convertColor(input);

  return {
    conversions,
    swatch: formatColor(color, "hex"),
    picker: toPickerHex(color),
  };
}

export function ColorConverterTool() {
  const [text, setText] = useState(DEFAULT_COLOR);
  const [reading, setReading] = useState(() => read(DEFAULT_COLOR));
  const [error, setError] = useState<string | null>(null);

  const change = (value: string) => {
    setText(value);

    try {
      setReading(read(value));
      setError(null);
    } catch (thrown) {
      if (thrown instanceof ColorParseError) {
        setError(thrown.message);
        return;
      }
      throw thrown;
    }
  };

  return (
    <ToolPanes>
      <div className="flex min-w-0 flex-col gap-4">
        <ToolField label="Colour">
          <div className="flex items-center gap-2">
            <Input
              value={text}
              onChange={(event) => change(event.target.value)}
              aria-label="Colour"
              aria-invalid={error !== null}
              spellCheck={false}
              placeholder={DEFAULT_COLOR}
              className="font-mono"
            />
            <input
              type="color"
              value={reading.picker}
              onChange={(event) => change(event.target.value)}
              aria-label="Pick a colour"
              className="h-11 w-14 shrink-0 cursor-pointer rounded-xl bg-muted p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </div>
        </ToolField>
        <p
          aria-live="polite"
          className={
            error ? "text-sm text-destructive" : "text-sm text-muted-foreground"
          }
        >
          {error ?? HINT}
        </p>
        <div
          aria-hidden="true"
          style={{ backgroundColor: reading.swatch }}
          className="h-40 w-full rounded-2xl ring-1 ring-border"
        />
      </div>
      <ToolField label="Formats">
        <ul
          aria-live="polite"
          className="divide-y divide-border rounded-2xl bg-card"
        >
          {reading.conversions.map((row) => (
            <li
              key={row.format}
              className="flex items-center justify-between gap-2 px-4 py-3"
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-xs text-muted-foreground">
                  {row.label}
                </span>
                <span className="truncate font-mono text-sm">{row.value}</span>
              </span>
              <CopyButton value={row.value} />
            </li>
          ))}
        </ul>
      </ToolField>
    </ToolPanes>
  );
}
