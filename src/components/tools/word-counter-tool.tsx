"use client";

import { useMemo, useState } from "react";
import { ToolField, ToolTextarea } from "~/components/tools/tool-io";
import { textStats } from "~/utils/word-counter";

export function WordCounterTool() {
  const [input, setInput] = useState("");
  const stats = useMemo(() => textStats(input), [input]);

  const figures = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Without spaces", value: stats.charactersNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    {
      label: "Reading time",
      value:
        stats.readingMinutes === 0 ? "0 min" : `${stats.readingMinutes} min`,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {figures.map((figure) => (
          <li key={figure.label} className="rounded-2xl bg-card p-4">
            <span className="block font-mono text-2xl font-medium tabular-nums">
              {figure.value}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {figure.label}
            </span>
          </li>
        ))}
      </ul>
      <ToolField label="Your text">
        <ToolTextarea
          value={input}
          onChange={setInput}
          placeholder="Paste or type here"
          className="h-96"
        />
      </ToolField>
    </div>
  );
}
