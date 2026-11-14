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
import { Checkbox } from "~/components/ui/checkbox";
import {
  type CsvDelimiter,
  CsvParseError,
  csvToJson,
  jsonToCsv,
} from "~/utils/csv-to-json";

type Direction = "to-json" | "to-csv";

const DIRECTIONS = [
  { value: "to-json" as const, label: "CSV to JSON" },
  { value: "to-csv" as const, label: "JSON to CSV" },
];

const DELIMITERS = [
  { value: "auto" as const, label: "Auto" },
  { value: "," as const, label: "Comma" },
  { value: ";" as const, label: "Semicolon" },
  { value: "\t" as const, label: "Tab" },
  { value: "|" as const, label: "Pipe" },
];

const CSV_SAMPLE = "name,age\nalice,31\nbob,42";

const JSON_SAMPLE = '[{ "name": "alice", "age": 31 }]';

interface RunOptions {
  header: boolean;
  delimiter: CsvDelimiter;
}

function run(
  direction: Direction,
  input: string,
  { header, delimiter }: RunOptions,
): { output: string; error: string | null } {
  try {
    return {
      output:
        direction === "to-json"
          ? csvToJson(input, { header, delimiter })
          : jsonToCsv(input, { delimiter }),
      error: null,
    };
  } catch (error) {
    if (error instanceof CsvParseError) {
      return { output: "", error: error.message };
    }
    throw error;
  }
}

export function CsvToJsonTool() {
  const [direction, setDirection] = useState<Direction>("to-json");
  const [delimiter, setDelimiter] = useState<CsvDelimiter>("auto");
  const [header, setHeader] = useState(true);
  const [input, setInput] = useState("");

  const toJson = direction === "to-json";
  const { output, error } = useMemo(
    () => run(direction, input, { header, delimiter }),
    [direction, input, header, delimiter],
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
      : { blob: new Blob([output], { type: "text/csv" }), name: "data.csv" };
  }, [output, toJson]);

  return (
    <div className="flex flex-col gap-5">
      <Segmented
        label="Direction"
        value={direction}
        options={DIRECTIONS}
        onChange={setDirection}
      />
      <ToolOptions>
        <Segmented
          label="Delimiter"
          value={delimiter}
          options={DELIMITERS}
          onChange={setDelimiter}
        />
        {toJson && (
          <label
            htmlFor="csv-header"
            className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground"
          >
            <Checkbox
              id="csv-header"
              checked={header}
              onCheckedChange={(checked) => setHeader(checked === true)}
            />
            First row is a header
          </label>
        )}
      </ToolOptions>
      <ToolPanes>
        <ToolField label={toJson ? "CSV" : "JSON"}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={toJson ? CSV_SAMPLE : JSON_SAMPLE}
            pasteFiles
          />
        </ToolField>
        <ToolField
          label={toJson ? "JSON" : "CSV"}
          action={<FileActions file={file} disabled={output === ""} />}
        >
          <ToolOutput value={output} error={error} />
        </ToolField>
      </ToolPanes>
    </div>
  );
}
