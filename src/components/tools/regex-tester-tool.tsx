"use client";

import { useMemo, useState } from "react";
import {
  ToolField,
  ToolOptions,
  ToolOutput,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  compileRegex,
  findMatches,
  RegexError,
  type RegexMatch,
  replaceMatches,
  splitByMatches,
} from "~/utils/regex-tester";

const FLAGS = [
  { value: "g", label: "Global" },
  { value: "i", label: "Ignore case" },
  { value: "m", label: "Multiline" },
  { value: "s", label: "Dot matches newline" },
  { value: "u", label: "Unicode" },
  { value: "y", label: "Sticky" },
];

const LIMIT = 500;

function compile(
  pattern: string,
  flags: string,
): { regex: RegExp | null; error: string | null } {
  if (pattern === "") {
    return { regex: null, error: null };
  }

  try {
    return { regex: compileRegex(pattern, flags), error: null };
  } catch (error) {
    if (error instanceof RegexError) {
      return { regex: null, error: error.message };
    }
    throw error;
  }
}

function countLabel(matches: readonly RegexMatch[]): string {
  if (matches.length >= LIMIT) {
    return `First ${LIMIT} matches`;
  }

  if (matches.length === 0) {
    return "No matches";
  }

  return matches.length === 1 ? "1 match" : `${matches.length} matches`;
}

export function RegexTesterTool() {
  const [pattern, setPattern] = useState("");
  const [active, setActive] = useState<readonly string[]>(["g"]);
  const [text, setText] = useState("");
  const [replacement, setReplacement] = useState("");

  const flags = FLAGS.filter((flag) => active.includes(flag.value))
    .map((flag) => flag.value)
    .join("");

  const { regex, error } = useMemo(
    () => compile(pattern, flags),
    [pattern, flags],
  );

  const matches = useMemo(
    () => (regex ? findMatches(regex, text, LIMIT) : []),
    [regex, text],
  );

  const parts = useMemo(
    () => (regex ? splitByMatches(text, matches) : []),
    [regex, text, matches],
  );

  const replaced = useMemo(
    () =>
      regex && replacement !== ""
        ? replaceMatches(regex, text, replacement)
        : "",
    [regex, text, replacement],
  );

  const toggleFlag = (flag: string, on: boolean) => {
    setActive((current) =>
      on ? [...current, flag] : current.filter((value) => value !== flag),
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <ToolField label="Pattern">
        <div className="flex items-center gap-1 rounded-xl bg-muted px-3 focus-within:ring-2 focus-within:ring-ring/60">
          <span aria-hidden="true" className="font-mono text-muted-foreground">
            /
          </span>
          <Input
            id="regex-pattern"
            aria-label="Pattern"
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            placeholder="[a-z]+"
            spellCheck={false}
            className="bg-transparent px-0 font-mono focus-visible:ring-0"
          />
          <span aria-hidden="true" className="font-mono text-muted-foreground">
            /{flags}
          </span>
        </div>
      </ToolField>
      <ToolOptions>
        {FLAGS.map((flag) => (
          <div key={flag.value} className="flex items-center gap-2">
            <Checkbox
              id={`flag-${flag.value}`}
              aria-label={flag.label}
              checked={active.includes(flag.value)}
              onCheckedChange={(checked) =>
                toggleFlag(flag.value, checked === true)
              }
            />
            <label
              htmlFor={`flag-${flag.value}`}
              className="font-mono text-sm text-muted-foreground"
            >
              {flag.value}
            </label>
          </div>
        ))}
      </ToolOptions>
      {error && (
        <p aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <ToolPanes>
        <ToolField label="Test text">
          <ToolTextarea
            value={text}
            onChange={setText}
            placeholder="Paste the text to match against"
            pasteFiles
          />
        </ToolField>
        <ToolField
          label="Matched text"
          action={
            <span aria-live="polite" className="text-sm text-muted-foreground">
              {countLabel(matches)}
            </span>
          }
        >
          <div className="scroll-slim h-72 w-full overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-card p-4 font-mono text-sm leading-relaxed">
            {text === "" ? (
              <span className="text-muted-foreground">
                The matches are picked out here.
              </span>
            ) : parts.length === 0 ? (
              text
            ) : (
              parts.map((part, index) => (
                <span
                  key={`${index}-${part.text}`}
                  className={
                    part.match
                      ? "rounded bg-tag-dev/25 text-tag-dev"
                      : undefined
                  }
                >
                  {part.text}
                </span>
              ))
            )}
          </div>
        </ToolField>
      </ToolPanes>
      <ToolField label="Matches">
        <div className="scroll-slim max-h-72 overflow-auto rounded-2xl bg-card p-4">
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every match, with its position and groups, is listed here.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {matches.map((match, index) => (
                <li
                  key={`${match.index}-${index}`}
                  className="flex min-w-0 flex-col gap-1"
                >
                  <span className="flex flex-wrap items-baseline gap-2 font-mono text-sm">
                    <span className="text-muted-foreground tabular-nums">
                      at {match.index}
                    </span>
                    <span className="min-w-0 break-words">
                      {match.text === "" ? "(empty match)" : match.text}
                    </span>
                  </span>
                  {match.groups.length > 0 && (
                    <ul className="flex flex-col gap-0.5 pl-4">
                      {match.groups.map((group) => (
                        <li
                          key={group.number}
                          className="font-mono text-xs text-muted-foreground"
                        >
                          {group.name ?? group.number}:{" "}
                          {group.value === null ? "(no match)" : group.value}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </ToolField>
      <ToolPanes>
        <ToolField label="Replacement">
          <Input
            id="regex-replacement"
            aria-label="Replacement"
            value={replacement}
            onChange={(event) => setReplacement(event.target.value)}
            placeholder="$1 or $<name>"
            spellCheck={false}
            className="font-mono"
          />
        </ToolField>
        <ToolField label="Result">
          <ToolOutput
            value={replaced}
            placeholder="Type a replacement to see the result."
            className="h-auto min-h-24"
          />
        </ToolField>
      </ToolPanes>
    </div>
  );
}
