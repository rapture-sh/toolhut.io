"use client";

import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { ToolField, ToolOptions, ToolPanes } from "~/components/tools/tool-io";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  type Color,
  ColorParseError,
  parseColor,
  toPickerHex,
} from "~/utils/color";
import {
  contrastRatio,
  formatRatio,
  WCAG_THRESHOLDS,
  wcagLevels,
} from "~/utils/contrast-checker";

const DEFAULT_TEXT = "#767676";

const DEFAULT_BACKGROUND = "#ffffff";

interface Field {
  text: string;
  color: Color;
  error: string | null;
}

/** Keeps the last colour that parsed, so the preview never goes blank. */
function read(text: string, previous: Color): Field {
  try {
    return { text, color: parseColor(text), error: null };
  } catch (thrown) {
    if (thrown instanceof ColorParseError) {
      return { text, color: previous, error: thrown.message };
    }
    throw thrown;
  }
}

function start(text: string): Field {
  return { text, color: parseColor(text), error: null };
}

export function ContrastCheckerTool() {
  const [text, setText] = useState<Field>(() => start(DEFAULT_TEXT));
  const [background, setBackground] = useState<Field>(() =>
    start(DEFAULT_BACKGROUND),
  );

  const ratio = contrastRatio(text.color, background.color);
  const levels = wcagLevels(ratio);

  const checks = [
    {
      key: "aa-normal",
      level: "AA",
      size: "Normal text",
      threshold: WCAG_THRESHOLDS.aaNormal,
      passes: levels.aa.normal,
    },
    {
      key: "aa-large",
      level: "AA",
      size: "Large text",
      threshold: WCAG_THRESHOLDS.aaLarge,
      passes: levels.aa.large,
    },
    {
      key: "aaa-normal",
      level: "AAA",
      size: "Normal text",
      threshold: WCAG_THRESHOLDS.aaaNormal,
      passes: levels.aaa.normal,
    },
    {
      key: "aaa-large",
      level: "AAA",
      size: "Large text",
      threshold: WCAG_THRESHOLDS.aaaLarge,
      passes: levels.aaa.large,
    },
  ];

  const swap = () => {
    setText(background);
    setBackground(text);
  };

  const preview = {
    color: toPickerHex(text.color),
    backgroundColor: toPickerHex(background.color),
  };

  return (
    <div className="flex flex-col gap-5">
      <ToolPanes>
        <ToolField label="Text colour">
          <div className="flex items-center gap-2">
            <Input
              value={text.text}
              onChange={(event) =>
                setText(read(event.target.value, text.color))
              }
              aria-label="Text colour"
              aria-invalid={text.error !== null}
              spellCheck={false}
              placeholder={DEFAULT_TEXT}
              className="font-mono"
            />
            <input
              type="color"
              value={toPickerHex(text.color)}
              onChange={(event) =>
                setText(read(event.target.value, text.color))
              }
              aria-label="Pick the text colour"
              className="h-11 w-14 shrink-0 cursor-pointer rounded-xl bg-muted p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </div>
        </ToolField>
        <ToolField label="Background colour">
          <div className="flex items-center gap-2">
            <Input
              value={background.text}
              onChange={(event) =>
                setBackground(read(event.target.value, background.color))
              }
              aria-label="Background colour"
              aria-invalid={background.error !== null}
              spellCheck={false}
              placeholder={DEFAULT_BACKGROUND}
              className="font-mono"
            />
            <input
              type="color"
              value={toPickerHex(background.color)}
              onChange={(event) =>
                setBackground(read(event.target.value, background.color))
              }
              aria-label="Pick the background colour"
              className="h-11 w-14 shrink-0 cursor-pointer rounded-xl bg-muted p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </div>
        </ToolField>
      </ToolPanes>
      <ToolOptions>
        <Button type="button" variant="secondary" onClick={swap}>
          <ArrowLeftRight />
          Swap the two colours
        </Button>
        <p aria-live="polite" className="text-sm text-destructive">
          {text.error ?? background.error ?? ""}
        </p>
      </ToolOptions>
      <div aria-live="polite" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl bg-card px-6 py-5">
          <span className="text-5xl font-bold tracking-[-0.04em] tabular-nums">
            {formatRatio(ratio)}
          </span>
          <span className="text-sm text-muted-foreground">contrast ratio</span>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {checks.map((check) => (
            <li
              key={check.key}
              className="flex flex-col items-start gap-2 rounded-2xl bg-card px-4 py-3"
            >
              <span className="text-sm font-medium">{check.level}</span>
              <span className="text-xs text-muted-foreground">
                {check.size}, needs {check.threshold}:1
              </span>
              {check.passes ? (
                <Badge>Pass</Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-destructive/15 text-destructive"
                >
                  Fail
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </div>
      <ToolField label="Preview">
        <div
          style={preview}
          className="flex flex-col gap-3 rounded-2xl px-6 py-6 ring-1 ring-border"
        >
          <p className="text-2xl font-bold tracking-[-0.03em]">
            Large text, the size a heading is set in.
          </p>
          <p className="text-base leading-relaxed">
            Normal text, the size most of a page is set in. Read this sentence
            at arm&apos;s length. If any of it is hard going, the pair of
            colours behind it is doing you no favours.
          </p>
        </div>
      </ToolField>
    </div>
  );
}
