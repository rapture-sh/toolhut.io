"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
} from "~/components/tools/tool-io";
import { Input } from "~/components/ui/input";
import {
  BASES,
  type Base,
  BaseConversionError,
  toAllBases,
} from "~/utils/number-base";

const BASE_OPTIONS = [
  { value: "10" as const, label: "Decimal" },
  { value: "16" as const, label: "Hex" },
  { value: "2" as const, label: "Binary" },
  { value: "8" as const, label: "Octal" },
];

const LABELS: Record<Base, string> = {
  2: "Binary",
  8: "Octal",
  10: "Decimal",
  16: "Hexadecimal",
};

export function NumberBaseTool() {
  const [from, setFrom] = useState("10");
  const [value, setValue] = useState("");

  const { results, error } = useMemo(() => {
    if (value.trim() === "") {
      return { results: null, error: null as string | null };
    }

    try {
      return { results: toAllBases(value, Number(from)), error: null };
    } catch (thrown) {
      if (thrown instanceof BaseConversionError) {
        return { results: null, error: thrown.message };
      }
      throw thrown;
    }
  }, [value, from]);

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="Input base"
          value={from}
          options={BASE_OPTIONS}
          onChange={setFrom}
        />
      </ToolOptions>

      <ToolField label="Number">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="255"
          spellCheck={false}
          className="h-14 rounded-2xl bg-card font-mono text-base"
        />
      </ToolField>

      {error ? (
        <p className="rounded-2xl bg-card p-4 font-mono text-sm text-destructive">
          {error}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {BASES.map((base) => (
            <li
              key={base}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-card px-4 py-3"
            >
              <span className="w-28 shrink-0 text-sm text-muted-foreground">
                {LABELS[base]}
              </span>
              <span className="min-w-0 flex-1 break-all font-mono text-sm">
                {results ? (
                  results[base]
                ) : (
                  <span className="text-muted-foreground">&mdash;</span>
                )}
              </span>
              <CopyButton value={results ? results[base] : ""} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
