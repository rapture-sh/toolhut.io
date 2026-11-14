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
import {
  type IndentWidth,
  jsonToYaml,
  YamlParseError,
  yamlToJson,
} from "~/utils/yaml-json";

type Direction = "to-json" | "to-yaml";

type IndentKey = "2" | "4";

const DIRECTIONS = [
  { value: "to-json" as const, label: "YAML to JSON" },
  { value: "to-yaml" as const, label: "JSON to YAML" },
];

const INDENTS = [
  { value: "2" as const, label: "2 spaces" },
  { value: "4" as const, label: "4 spaces" },
];

const YAML_SAMPLE = "name: toolhut\ntags:\n  - data\n  - dev";

const JSON_SAMPLE = '{ "name": "toolhut", "tags": ["data", "dev"] }';

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
          ? yamlToJson(input, { indent })
          : jsonToYaml(input),
      error: null,
    };
  } catch (error) {
    if (error instanceof YamlParseError) {
      return { output: "", error: error.message };
    }
    throw error;
  }
}

export function YamlJsonTool() {
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
          blob: new Blob([output], { type: "application/yaml" }),
          name: "data.yaml",
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
        <ToolField label={toJson ? "YAML" : "JSON"}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={toJson ? YAML_SAMPLE : JSON_SAMPLE}
            pasteFiles
          />
        </ToolField>
        <ToolField
          label={toJson ? "JSON" : "YAML"}
          action={<FileActions file={file} disabled={output === ""} />}
        >
          <CodeView
            value={output}
            error={error}
            language={direction === "to-json" ? "json" : "yaml"}
          />
        </ToolField>
      </ToolPanes>
    </div>
  );
}
