"use client";

import { useMemo, useState } from "react";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { Base64DecodeError, decodeBase64, encodeBase64 } from "~/utils/base64";

type Mode = "encode" | "decode";

interface Result {
  output: string;
  error: string | null;
}

function run(mode: Mode, input: string): Result {
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
  const { copied, copy } = useCopyToClipboard();

  const { output, error } = useMemo(() => run(mode, input), [mode, input]);

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex w-fit gap-1 rounded-lg border border-border p-1">
        <legend className="sr-only">Direction</legend>
        {(["encode", "decode"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => setMode(option)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              mode === option
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            {mode === "encode" ? "Text" : "Base64"}
          </span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            rows={12}
            placeholder={
              mode === "encode" ? "Paste text here" : "Paste Base64 here"
            }
            className="resize-y rounded-lg border border-border bg-transparent p-3 font-mono text-sm outline-none focus-visible:border-foreground"
          />
        </label>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">
              {mode === "encode" ? "Base64" : "Text"}
            </span>
            <button
              type="button"
              disabled={output === ""}
              onClick={() => copy(output)}
              className="rounded-md px-2 py-1 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <output
            aria-live="polite"
            className="min-h-[18rem] whitespace-pre-wrap break-all rounded-lg border border-border bg-transparent p-3 font-mono text-sm"
          >
            {error ? <span className="text-red-600">{error}</span> : output}
          </output>
        </div>
      </div>
    </div>
  );
}
