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
  jsonToXml,
  XmlParseError,
  xmlToJson,
} from "~/utils/xml-json";

type Direction = "to-json" | "to-xml";

type IndentKey = "2" | "4";

const DIRECTIONS = [
  { value: "to-json" as const, label: "XML to JSON" },
  { value: "to-xml" as const, label: "JSON to XML" },
];

const INDENTS = [
  { value: "2" as const, label: "2 spaces" },
  { value: "4" as const, label: "4 spaces" },
];

const XML_SAMPLE = '<book id="1">\n  <title>Dune</title>\n</book>';

const JSON_SAMPLE = '{ "book": { "@id": "1", "title": "Dune" } }';

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
          ? xmlToJson(input, { indent })
          : jsonToXml(input),
      error: null,
    };
  } catch (error) {
    if (error instanceof XmlParseError) {
      return { output: "", error: error.message };
    }
    throw error;
  }
}

export function XmlJsonTool() {
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
          blob: new Blob([output], { type: "application/xml" }),
          name: "data.xml",
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
        <ToolField label={toJson ? "XML" : "JSON"}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={toJson ? XML_SAMPLE : JSON_SAMPLE}
            pasteFiles
          />
        </ToolField>
        <ToolField
          label={toJson ? "JSON" : "XML"}
          action={<FileActions file={file} disabled={output === ""} />}
        >
          <ToolOutput value={output} error={error} />
        </ToolField>
      </ToolPanes>
    </div>
  );
}
