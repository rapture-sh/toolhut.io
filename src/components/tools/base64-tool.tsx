"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOutput,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { Base64DecodeError, decodeBase64, encodeBase64 } from "~/utils/base64";

type Mode = "encode" | "decode";

const MODES = [
  { value: "encode" as const, label: "Encode" },
  { value: "decode" as const, label: "Decode" },
];

function run(
  mode: Mode,
  input: string,
): { output: string; error: string | null } {
  try {
    return {
      output: mode === "encode" ? encodeBase64(input) : decodeBase64(input),
      error: null,
    };
  } catch (error) {
    if (error instanceof Base64DecodeError) {
      return { output: "", error: error.message };
    }
    throw error;
  }
}

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const { output, error } = useMemo(() => run(mode, input), [mode, input]);

  return (
    <div className="flex flex-col gap-5">
      <Segmented
        label="Direction"
        value={mode}
        options={MODES}
        onChange={setMode}
      />
      <ToolPanes>
        <ToolField label={mode === "encode" ? "Text" : "Base64"}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={
              mode === "encode" ? "Paste text here" : "Paste Base64 here"
            }
          />
        </ToolField>
        <ToolField
          label={mode === "encode" ? "Base64" : "Text"}
          action={<CopyButton value={output} />}
        >
          <ToolOutput value={output} error={error} />
        </ToolField>
      </ToolPanes>
    </div>
  );
}
