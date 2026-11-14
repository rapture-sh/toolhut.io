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
  formatSql,
  minifySql,
  SQL_DIALECTS,
  type SqlDialect,
  SqlFormatError,
  type SqlKeywordCase,
  type TabWidth,
} from "~/utils/sql-formatter";

type Mode = "format" | "minify";

type IndentKey = "2" | "4";

const MODES = [
  { value: "format" as const, label: "Format" },
  { value: "minify" as const, label: "Minify" },
];

const KEYWORD_CASE_OPTIONS = [
  { value: "upper" as const, label: "Upper" },
  { value: "preserve" as const, label: "Keep" },
];

const INDENTS = [
  { value: "2" as const, label: "2 spaces" },
  { value: "4" as const, label: "4 spaces" },
];

const SAMPLE = "select a, b from t where x = 1 order by a";

function widthOf(key: IndentKey): TabWidth {
  return key === "2" ? 2 : 4;
}

interface RunOptions {
  dialect: SqlDialect;
  keywordCase: SqlKeywordCase;
  tabWidth: TabWidth;
}

function run(
  mode: Mode,
  input: string,
  options: RunOptions,
): { output: string; error: string | null } {
  try {
    return {
      output: mode === "format" ? formatSql(input, options) : minifySql(input),
      error: null,
    };
  } catch (error) {
    if (error instanceof SqlFormatError) {
      return { output: "", error: error.message };
    }
    throw error;
  }
}

export function SqlFormatterTool() {
  const [mode, setMode] = useState<Mode>("format");
  const [dialect, setDialect] = useState<SqlDialect>("sql");
  const [keywordCase, setKeywordCase] = useState<SqlKeywordCase>("upper");
  const [indent, setIndent] = useState<IndentKey>("2");
  const [input, setInput] = useState("");

  const formatting = mode === "format";
  const { output, error } = useMemo(
    () =>
      run(mode, input, {
        dialect,
        keywordCase,
        tabWidth: widthOf(indent),
      }),
    [mode, input, dialect, keywordCase, indent],
  );

  const file = useCallback((): OutputFile | null => {
    if (output === "") {
      return null;
    }

    return {
      blob: new Blob([output], { type: "application/sql" }),
      name: "query.sql",
    };
  }, [output]);

  return (
    <div className="flex flex-col gap-5">
      <Segmented label="Mode" value={mode} options={MODES} onChange={setMode} />
      {formatting && (
        <ToolOptions>
          <Segmented
            label="Dialect"
            value={dialect}
            options={SQL_DIALECTS}
            onChange={setDialect}
          />
          <Segmented
            label="Keywords"
            value={keywordCase}
            options={KEYWORD_CASE_OPTIONS}
            onChange={setKeywordCase}
          />
          <Segmented
            label="Indent"
            value={indent}
            options={INDENTS}
            onChange={setIndent}
          />
        </ToolOptions>
      )}
      <ToolPanes>
        <ToolField label="Query">
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={SAMPLE}
            pasteFiles
          />
        </ToolField>
        <ToolField
          label={formatting ? "Formatted" : "One line"}
          action={<FileActions file={file} disabled={output === ""} />}
        >
          <CodeView language="sql" value={output} error={error} />
        </ToolField>
      </ToolPanes>
    </div>
  );
}
