"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  CopyButton,
  ToolField,
  ToolOptions,
  ToolPanes,
} from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  CRON_FIELD_LABELS,
  CRON_PRESETS,
  CronParseError,
  cronFields,
  explainCron,
  nextRuns,
} from "~/utils/cron-parser";

interface Reading {
  sentence: string;
  runs: Date[];
  error: string | null;
}

function read(expression: string, now: Date | null): Reading {
  if (expression.trim() === "") {
    return { sentence: "", runs: [], error: null };
  }

  try {
    return {
      sentence: explainCron(expression),
      runs: now ? nextRuns(expression, { count: 5, now }) : [],
      error: null,
    };
  } catch (error) {
    if (error instanceof CronParseError) {
      return { sentence: "", runs: [], error: error.message };
    }
    throw error;
  }
}

export function CronParserTool() {
  const [expression, setExpression] = useState("0 9 * * MON");
  const [now, setNow] = useState<Date | null>(null);
  const inputId = useId();

  useEffect(() => {
    setNow(new Date());
  }, []);

  const { sentence, runs, error } = useMemo(
    () => read(expression, now),
    [expression, now],
  );

  const tokens = useMemo(() => cronFields(expression), [expression]);

  const when = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <ToolPanes>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-5 gap-2">
            {CRON_FIELD_LABELS.map((label, index) => (
              <div
                key={label}
                className="flex min-w-0 flex-col gap-1 rounded-xl bg-card px-2 py-2"
              >
                <span className="truncate text-xs text-muted-foreground">
                  {label}
                </span>
                <span className="truncate font-mono text-sm">
                  {tokens[index] === "" ? "?" : tokens[index]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex min-h-9 items-center justify-between gap-2">
              <label htmlFor={inputId} className="text-sm font-medium">
                Cron expression
              </label>
              <CopyButton value={expression.trim()} />
            </div>
            <Input
              id={inputId}
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              placeholder="*/15 * * * *"
              spellCheck={false}
              className="font-mono"
            />
          </div>
          <ToolOptions>
            {CRON_PRESETS.map((preset) => (
              <Button
                key={preset.expression}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setExpression(preset.expression)}
              >
                {preset.label}
              </Button>
            ))}
          </ToolOptions>
        </div>
        <div className="flex flex-col gap-3">
          <ToolField label="In plain English">
            <div
              aria-live="polite"
              className="rounded-2xl bg-card px-4 py-5 sm:px-5"
            >
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : sentence === "" ? (
                <p className="text-sm text-muted-foreground">
                  Type an expression, or pick one below.
                </p>
              ) : (
                <p className="text-balance text-xl font-medium leading-snug sm:text-2xl">
                  {sentence}
                </p>
              )}
            </div>
          </ToolField>
          <ToolField label="Next five runs">
            <div
              aria-live="polite"
              className="scroll-slim w-full overflow-auto rounded-2xl bg-card p-2"
            >
              {runs.length === 0 ? (
                <p className="p-2 text-sm text-muted-foreground">
                  The next runs appear here, in your own time zone.
                </p>
              ) : (
                <ol className="flex flex-col">
                  {runs.map((run, index) => (
                    <li
                      key={run.toISOString()}
                      className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-2 py-2"
                    >
                      <span className="text-sm text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="min-w-0 font-mono text-sm">
                        {when.format(run)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </ToolField>
        </div>
      </ToolPanes>
    </div>
  );
}
