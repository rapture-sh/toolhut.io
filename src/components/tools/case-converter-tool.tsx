"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  ToolField,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { type CaseName, toCase } from "~/utils/case-converter";

const CASES: { name: CaseName; label: string }[] = [
  { name: "camel", label: "camelCase" },
  { name: "pascal", label: "PascalCase" },
  { name: "snake", label: "snake_case" },
  { name: "kebab", label: "kebab-case" },
  { name: "constant", label: "CONSTANT_CASE" },
  { name: "title", label: "Title Case" },
  { name: "sentence", label: "Sentence case" },
];

export function CaseConverterTool() {
  const [input, setInput] = useState("");

  const results = useMemo(
    () =>
      CASES.map((entry) => ({ ...entry, value: toCase(input, entry.name) })),
    [input],
  );

  return (
    <div className="flex flex-col gap-5">
      <ToolField label="Your text">
        <ToolTextarea
          value={input}
          onChange={setInput}
          placeholder="parse HTTP response"
          rows={4}
        />
      </ToolField>
      <ul className="flex flex-col gap-2">
        {results.map((result) => (
          <li
            key={result.name}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-card px-4 py-3"
          >
            <span className="w-36 shrink-0 text-sm text-muted-foreground">
              {result.label}
            </span>
            <span className="min-w-0 flex-1 break-all font-mono text-sm">
              {result.value === "" ? (
                <span className="text-muted-foreground">&mdash;</span>
              ) : (
                result.value
              )}
            </span>
            <CopyButton value={result.value} />
          </li>
        ))}
      </ul>
    </div>
  );
}
