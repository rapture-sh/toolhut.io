"use client";

import { useCallback, useMemo, useState } from "react";
import { FileActions, type OutputFile } from "~/components/tools/tool-actions";
import {
  ToolField,
  ToolOptions,
  ToolOutput,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { Input } from "~/components/ui/input";
import { JsonParseError, jsonToTypeScript } from "~/utils/json-to-typescript";

function run(
  input: string,
  rootName: string,
): { output: string; error: string | null } {
  try {
    return { output: jsonToTypeScript(input, { rootName }), error: null };
  } catch (error) {
    if (error instanceof JsonParseError) {
      return { output: "", error: error.message };
    }
    throw error;
  }
}

export function JsonToTypescriptTool() {
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("Root");

  const { output, error } = useMemo(
    () => run(input, rootName),
    [input, rootName],
  );

  const file = useCallback((): OutputFile | null => {
    if (output === "") {
      return null;
    }

    return {
      blob: new Blob([output], { type: "text/plain;charset=utf-8" }),
      name: "types.ts",
    };
  }, [output]);

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <div className="flex min-w-0 items-center gap-3">
          <label htmlFor="root-name" className="text-sm font-medium">
            Root name
          </label>
          <Input
            id="root-name"
            value={rootName}
            onChange={(event) => setRootName(event.target.value)}
            placeholder="Root"
            spellCheck={false}
            className="h-10 w-44 font-mono"
          />
        </div>
      </ToolOptions>
      <ToolPanes>
        <ToolField label="JSON sample">
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder="Paste a JSON sample here"
            pasteFiles
          />
        </ToolField>
        <ToolField
          label="TypeScript"
          action={<FileActions file={file} disabled={output === ""} />}
        >
          <ToolOutput
            value={output}
            error={error}
            placeholder="The interfaces appear here."
          />
        </ToolField>
      </ToolPanes>
    </div>
  );
}
