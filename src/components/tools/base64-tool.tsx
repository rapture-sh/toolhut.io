"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { cn } from "~/lib/utils";
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
      <fieldset className="flex w-fit gap-1 rounded-full bg-card p-1">
        <legend className="sr-only">Direction</legend>
        {(["encode", "decode"] as const).map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={mode === option ? "default" : "ghost"}
            aria-pressed={mode === option}
            onClick={() => setMode(option)}
            className={cn(
              "rounded-full capitalize",
              mode !== option && "text-muted-foreground",
            )}
          >
            {option}
          </Button>
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
            className="resize-y rounded-2xl bg-card p-4 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">
              {mode === "encode" ? "Base64" : "Text"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={output === ""}
              onClick={() => copy(output)}
              className="text-muted-foreground"
            >
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <output
            aria-live="polite"
            className="min-h-72 whitespace-pre-wrap break-all rounded-2xl bg-card p-4 font-mono text-sm"
          >
            {error ? <span className="text-destructive">{error}</span> : output}
          </output>
        </div>
      </div>
    </div>
  );
}
