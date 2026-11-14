"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeView } from "~/components/tools/code-view";
import { FileActions, type OutputFile } from "~/components/tools/tool-actions";
import {
  Segmented,
  ToolField,
  ToolOptions,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { Checkbox } from "~/components/ui/checkbox";
import {
  formatJson,
  type JsonIndent,
  JsonParseError,
  minifyJson,
} from "~/utils/json-formatter";

type Mode = "format" | "minify";
type IndentChoice = "2" | "4" | "tab";

const MODES = [
  { value: "format" as const, label: "Format" },
  { value: "minify" as const, label: "Minify" },
];

const INDENTS = [
  { value: "2" as const, label: "2 spaces" },
  { value: "4" as const, label: "4 spaces" },
  { value: "tab" as const, label: "Tab" },
];

const INDENT_VALUES: Record<IndentChoice, JsonIndent> = {
  "2": 2,
  "4": 4,
  tab: "tab",
};

function run(
  mode: Mode,
  input: string,
  indent: IndentChoice,
  sortKeys: boolean,
): { output: string; error: string | null } {
  try {
    if (mode === "format") {
      return {
        output: formatJson(input, { indent: INDENT_VALUES[indent], sortKeys }),
        error: null,
      };
    }

    // Sorting lives in formatJson, so a sorted minify formats first.
    const sorted = sortKeys ? formatJson(input, { sortKeys: true }) : input;

    return { output: minifyJson(sorted), error: null };
  } catch (error) {
    if (error instanceof JsonParseError) {
      return { output: "", error: error.message };
    }
    throw error;
  }
}

export function JsonFormatterTool() {
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState<IndentChoice>("2");
  const [sortKeys, setSortKeys] = useState(false);
  const [input, setInput] = useState("");

  const { output, error } = useMemo(
    () => run(mode, input, indent, sortKeys),
    [mode, input, indent, sortKeys],
  );

  const file = useCallback((): OutputFile | null => {
    if (output === "") {
      return null;
    }

    return {
      blob: new Blob([output], { type: "application/json" }),
      name: "formatted.json",
    };
  }, [output]);

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="What to do"
          value={mode}
          options={MODES}
          onChange={setMode}
        />
        {mode === "format" && (
          <Segmented
            label="Indent"
            value={indent}
            options={INDENTS}
            onChange={setIndent}
          />
        )}
        <div className="flex items-center gap-2">
          <Checkbox
            id="sort-keys"
            checked={sortKeys}
            onCheckedChange={(checked) => setSortKeys(checked === true)}
          />
          <label htmlFor="sort-keys" className="text-sm">
            Sort keys
          </label>
        </div>
      </ToolOptions>
      <ToolPanes>
        <ToolField label="JSON">
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder="Paste JSON here"
            pasteFiles
          />
        </ToolField>
        <ToolField
          label={mode === "format" ? "Formatted" : "Minified"}
          action={<FileActions file={file} disabled={output === ""} />}
        >
          <CodeView
            value={output}
            error={error}
            placeholder="The result appears here, and so does the first mistake."
            language="json"
          />
        </ToolField>
      </ToolPanes>
    </div>
  );
}
