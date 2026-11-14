"use client";

import { useMemo, useState } from "react";
import {
  Segmented,
  ToolField,
  ToolOptions,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { cn } from "~/lib/utils";
import {
  type DiffRow,
  diffLines,
  summarise,
  toRows,
  type WordPart,
} from "~/utils/text-diff";

type View = "lines" | "inline";

const VIEWS = [
  { value: "lines" as const, label: "Line by line" },
  { value: "inline" as const, label: "Inline" },
];

const ROW_STYLES: Record<DiffRow["type"], string> = {
  added: "bg-tag-web/10 text-tag-web",
  removed: "bg-tag-pdf/10 text-tag-pdf",
  changed: "bg-tag-data/10 text-foreground",
  unchanged: "text-muted-foreground",
};

const MARKS: Record<DiffRow["type"], string> = {
  added: "+",
  removed: "-",
  changed: "~",
  unchanged: " ",
};

const WORD_STYLES: Record<WordPart["type"], string> = {
  added: "rounded bg-tag-web/25 text-tag-web",
  removed: "rounded bg-tag-pdf/25 text-tag-pdf line-through",
  unchanged: "",
};

function Gutter({ left, right }: { left?: number; right?: number }) {
  return (
    <span className="flex shrink-0 select-none gap-2 pr-3 text-right font-mono text-xs text-muted-foreground/60 tabular-nums">
      <span className="w-8">{left ?? ""}</span>
      <span className="w-8">{right ?? ""}</span>
    </span>
  );
}

function Row({ row }: { row: DiffRow }) {
  return (
    <li
      className={cn(
        "flex items-start rounded-lg py-0.5 pr-2",
        ROW_STYLES[row.type],
      )}
    >
      <Gutter left={row.left} right={row.right} />
      <span className="w-4 shrink-0 select-none text-center opacity-70">
        {MARKS[row.type]}
      </span>
      <span className="min-w-0 whitespace-pre-wrap break-words">
        {row.parts
          ? row.parts.map((part, index) => (
              <span
                key={`${part.type}-${index}-${part.text}`}
                className={WORD_STYLES[part.type]}
              >
                {part.text}
              </span>
            ))
          : row.text === ""
            ? " "
            : row.text}
      </span>
    </li>
  );
}

export function TextDiffTool() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [view, setView] = useState<View>("lines");

  const lines = useMemo(() => diffLines(left, right), [left, right]);
  const rows = useMemo(
    () => (view === "inline" ? toRows(lines) : (lines as DiffRow[])),
    [lines, view],
  );
  const summary = useMemo(() => summarise(lines), [lines]);
  const identical = lines.length > 0 && summary.added + summary.removed === 0;

  return (
    <div className="flex flex-col gap-5">
      <ToolPanes>
        <ToolField label="Original">
          <ToolTextarea
            value={left}
            onChange={setLeft}
            placeholder="Paste the first version"
          />
        </ToolField>
        <ToolField label="Changed">
          <ToolTextarea
            value={right}
            onChange={setRight}
            placeholder="Paste the second version"
          />
        </ToolField>
      </ToolPanes>

      <ToolOptions>
        <Segmented
          label="View"
          value={view}
          options={VIEWS}
          onChange={setView}
        />
      </ToolOptions>

      <ToolField label="Difference">
        <div className="overflow-hidden rounded-2xl bg-card">
          <div className="scroll-slim h-80 overflow-auto p-2">
            {rows.length === 0 ? (
              <p className="p-2 font-mono text-sm text-muted-foreground">
                Paste both versions to see what changed.
              </p>
            ) : (
              <ol className="font-mono text-sm leading-relaxed">
                {rows.map((row, index) => (
                  <Row
                    key={`${row.type}-${row.left ?? "x"}-${row.right ?? "x"}-${index}`}
                    row={row}
                  />
                ))}
              </ol>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-hairline px-5 py-3 font-mono text-xs">
            <span className="text-tag-web">+{summary.added} added</span>
            <span className="text-tag-pdf">-{summary.removed} removed</span>
            <span className="text-muted-foreground">
              {summary.unchanged} unchanged
            </span>
            {identical && (
              <span className="text-muted-foreground">
                the two versions are identical
              </span>
            )}
          </div>
        </div>
      </ToolField>
    </div>
  );
}
