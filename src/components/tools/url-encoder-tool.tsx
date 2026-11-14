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
import {
  decodeUrl,
  encodeUrl,
  parseQuery,
  UrlDecodeError,
  type UrlScope,
} from "~/utils/url-encoder";

type Mode = "encode" | "decode";

const MODES = [
  { value: "encode" as const, label: "Encode" },
  { value: "decode" as const, label: "Decode" },
];

const SCOPES = [
  { value: "component" as const, label: "Value" },
  { value: "full" as const, label: "Whole URL" },
];

export function UrlEncoderTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [scope, setScope] = useState<UrlScope>("component");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    try {
      return {
        output:
          mode === "encode" ? encodeUrl(input, scope) : decodeUrl(input, scope),
        error: null as string | null,
      };
    } catch (thrown) {
      if (thrown instanceof UrlDecodeError) {
        return { output: "", error: thrown.message };
      }
      throw thrown;
    }
  }, [mode, scope, input]);

  const parameters = useMemo(() => parseQuery(input), [input]);

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="Direction"
          value={mode}
          options={MODES}
          onChange={setMode}
        />
        <Segmented
          label="Scope"
          value={scope}
          options={SCOPES}
          onChange={setScope}
        />
      </ToolOptions>

      <ToolPanes>
        <ToolField label={mode === "encode" ? "Plain" : "Encoded"}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder="https://toolhut.io/search?q=hello world"
          />
        </ToolField>
        <ToolField
          label={mode === "encode" ? "Encoded" : "Plain"}
          action={<CopyButton value={output} />}
        >
          <ToolOutput value={output} error={error} />
        </ToolField>
      </ToolPanes>

      {parameters.length > 0 && (
        <ToolField label="Query parameters">
          <ul className="flex flex-col gap-1 rounded-2xl bg-card p-2">
            {parameters.map((parameter, index) => (
              <li
                key={`${parameter.key}-${index}`}
                className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl px-3 py-2 font-mono text-sm"
              >
                <span className="shrink-0 text-tag-dev">{parameter.key}</span>
                <span className="min-w-0 break-all text-muted-foreground">
                  {parameter.value === "" ? "(empty)" : parameter.value}
                </span>
              </li>
            ))}
          </ul>
        </ToolField>
      )}
    </div>
  );
}
