"use client";

import { useCallback, useMemo, useState } from "react";
import { FileActions, type OutputFile } from "~/components/tools/tool-actions";
import {
  Segmented,
  ToolField,
  ToolOptions,
  ToolOutput,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import {
  type IndentWidth,
  jsonToToml,
  TomlParseError,
  tomlToJson,
} from "~/utils/toml-json";

type Direction = "to-json" | "to-toml";

type IndentKey = "2" | "4";

const DIRECTIONS = [
  { value: "to-json" as const, label: "TOML to JSON" },
  { value: "to-toml" as const, label: "JSON to TOML" },
];

const INDENTS = [
  { value: "2" as const, label: "2 spaces" },
  { value: "4" as const, label: "4 spaces" },
];

const TOML_SAMPLE = 'title = "toolhut"\n\n[owner]\nname = "abi"';

const JSON_SAMPLE = '{ "title": "toolhut", "owner": { "name": "abi" } }';

function widthOf(key: IndentKey): IndentWidth {
  return key === "2" ? 2 : 4;
}

function run(
  direction: Direction,
  input: string,
  indent: IndentWidth,
): { output: string; error: string | null } {
  try {
    return {
      output:
        direction === "to-json"
          ? tomlToJson(input, { indent })
          : jsonToToml(input),
      error: null,
    };
  } catch (error) {
    if (error instanceof TomlParseError) {
      return { output: "", error: error.message };
    }
    throw error;
  }
}

export function TomlJsonTool() {
  const [direction, setDirection] = useState<Direction>("to-json");
  const [indent, setIndent] = useState<IndentKey>("2");
  const [input, setInput] = useState("");

  const toJson = direction === "to-json";
  const { output, error } = useMemo(
    () => run(direction, input, widthOf(indent)),
    [direction, input, indent],
  );

  const file = useCallback((): OutputFile | null => {
    if (output === "") {
      return null;
    }

    return toJson
      ? {
          blob: new Blob([output], { type: "application/json" }),
          name: "data.json",
        }
      : {
          blob: new Blob([output], { type: "application/toml" }),
          name: "data.toml",
        };
  }, [output, toJson]);

  return (
    <div className="flex flex-col gap-5">
      <Segmented
        label="Direction"
        value={direction}
        options={DIRECTIONS}
        onChange={setDirection}
      />
      {toJson && (
        <ToolOptions>
          <Segmented
            label="JSON indent"
            value={indent}
            options={INDENTS}
            onChange={setIndent}
          />
        </ToolOptions>
      )}
      <ToolPanes>
        <ToolField label={toJson ? "TOML" : "JSON"}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={toJson ? TOML_SAMPLE : JSON_SAMPLE}
            pasteFiles
          />
        </ToolField>
        <ToolField
          label={toJson ? "JSON" : "TOML"}
          action={<FileActions file={file} disabled={output === ""} />}
        >
          <ToolOutput value={output} error={error} />
        </ToolField>
      </ToolPanes>
    </div>
  );
}
