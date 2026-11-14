"use client";

import { useId, useMemo, useState } from "react";
import {
  CopyButton,
  ToolField,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import {
  parseUserAgent,
  summariseUserAgent,
  UserAgentError,
  type UserAgentRow,
} from "~/utils/user-agent-parser";

interface Parsed {
  rows: UserAgentRow[];
  error: string | null;
}

function parse(input: string): Parsed {
  if (input.trim() === "") {
    return { rows: [], error: null };
  }

  try {
    return { rows: parseUserAgent(input), error: null };
  } catch (error) {
    if (error instanceof UserAgentError) {
      return { rows: [], error: error.message };
    }
    throw error;
  }
}

export function UserAgentParserTool() {
  const [input, setInput] = useState("");
  const inputId = useId();
  const { rows, error } = useMemo(() => parse(input), [input]);

  const useMine = () => {
    if (typeof navigator !== "undefined") {
      setInput(navigator.userAgent);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <ToolPanes>
        <div className="flex flex-col gap-3">
          <ToolField
            label="User agent string"
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={useMine}
              >
                Use mine
              </Button>
            }
          >
            <ToolTextarea
              id={inputId}
              value={input}
              onChange={setInput}
              placeholder="Paste a user agent string here"
              className="h-44"
            />
          </ToolField>
          <p className="text-sm text-muted-foreground">
            The string is read here in your browser, and never sent anywhere.
          </p>
        </div>
        <ToolField
          label="What it says"
          action={<CopyButton value={summariseUserAgent(rows)} />}
        >
          <div
            aria-live="polite"
            className="scroll-slim w-full overflow-auto rounded-2xl bg-card p-2"
          >
            {error && <p className="p-2 text-sm text-destructive">{error}</p>}
            {!error && rows.length === 0 && (
              <p className="p-2 text-sm text-muted-foreground">
                Paste a string, or use your own.
              </p>
            )}
            {rows.length > 0 && (
              <dl className="flex flex-col">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-2 py-2"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="min-w-0 break-words font-mono text-sm">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </ToolField>
      </ToolPanes>
    </div>
  );
}
