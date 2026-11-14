"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
  ToolOutput,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { decodeEntities, encodeEntities } from "~/utils/html-entities";

type Mode = "encode" | "decode";

const MODES = [
  { value: "encode" as const, label: "Encode" },
  { value: "decode" as const, label: "Decode" },
];

export function HtmlEntitiesTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [nonAscii, setNonAscii] = useState(false);
  const [input, setInput] = useState("");

  const output = useMemo(
    () =>
      mode === "encode"
        ? encodeEntities(input, { nonAscii })
        : decodeEntities(input),
    [mode, nonAscii, input],
  );

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="Direction"
          value={mode}
          options={MODES}
          onChange={setMode}
        />
        {mode === "encode" && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={nonAscii}
              onChange={(event) => setNonAscii(event.target.checked)}
              className="size-4 accent-primary"
            />
            Escape accents and symbols too
          </label>
        )}
      </ToolOptions>
      <ToolPanes>
        <ToolField label={mode === "encode" ? "Text" : "Entities"}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={
              mode === "encode" ? "<p>it's & more</p>" : "&lt;p&gt;it&#39;s"
            }
          />
        </ToolField>
        <ToolField
          label={mode === "encode" ? "Entities" : "Text"}
          action={<CopyButton value={output} />}
        >
          <ToolOutput value={output} />
        </ToolField>
      </ToolPanes>
    </div>
  );
}
