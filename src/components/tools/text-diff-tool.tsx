"use client";

import { useMemo, useState } from "react";
import { ToolField, ToolPanes, ToolTextarea } from "~/components/tools/tool-io";
import { cn } from "~/lib/utils";
import { type DiffType, diffLines, summarise } from "~/utils/text-diff";

const LINE_STYLES: Record<DiffType, string> = {
  added: "bg-tag-web/15 text-tag-web",
  removed: "bg-tag-pdf/15 text-tag-pdf",
  unchanged: "text-muted-foreground",
};

const MARKS: Record<DiffType, string> = {
  added: "+",
  removed: "-",
  unchanged: " ",
};

export function TextDiffTool() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const lines = useMemo(() => diffLines(left, right), [left, right]);
  const summary = useMemo(() => summarise(lines), [lines]);

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

      <ToolField
        label="Difference"
        action={
          <span className="font-mono text-xs text-muted-foreground">
            <span className="text-tag-web">+{summary.added}</span>{" "}
            <span className="text-tag-pdf">-{summary.removed}</span>{" "}
            {summary.unchanged} same
          </span>
        }
      >
        <div className="min-h-56 overflow-x-auto rounded-2xl bg-card p-2">
          {lines.length === 0 ? (
            <p className="p-2 font-mono text-sm text-muted-foreground">
              Paste both versions to see what changed.
            </p>
          ) : (
            <ol className="font-mono text-sm leading-relaxed">
              {lines.map((line, index) => (
                <li
                  key={`${line.type}-${line.left ?? "x"}-${line.right ?? "x"}-${index}`}
                  className={cn(
                    "flex gap-3 whitespace-pre rounded-lg px-2 py-0.5",
                    LINE_STYLES[line.type],
                  )}
                >
                  <span className="w-4 shrink-0 select-none opacity-70">
                    {MARKS[line.type]}
                  </span>
                  <span className="min-w-0">
                    {line.text === "" ? " " : line.text}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </ToolField>
    </div>
  );
}
