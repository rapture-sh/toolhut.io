"use client";

import { useMemo } from "react";
import { useToolField } from "~/components/tools/tool-io";
import { cn } from "~/lib/utils";
import { highlightJson, type JsonTokenKind } from "~/utils/json-highlight";

const TOKEN_STYLES: Record<JsonTokenKind, string> = {
  key: "text-primary",
  string: "text-tag-web",
  number: "text-tag-data",
  boolean: "text-tag-time",
  null: "text-tag-color",
  punctuation: "text-muted-foreground",
};

interface JsonViewProps {
  /** Anything `JSON.parse` can return. */
  value: unknown;
  /** Set while there is nothing to show, so the field is not an empty box. */
  empty?: boolean;
  placeholder?: string;
  indent?: number;
  className?: string;
}

/**
 * JSON with its parts coloured, growing with the document instead of sitting
 * at a fixed height, and scrolling only once it gets genuinely long.
 */
export function JsonView({
  value,
  empty = false,
  placeholder = "The result appears here.",
  indent = 2,
  className,
}: JsonViewProps) {
  const field = useToolField();
  const tokens = useMemo(
    () => (empty ? [] : highlightJson(value, indent)),
    [value, indent, empty],
  );

  return (
    <output
      id={field?.id}
      aria-labelledby={field?.labelId}
      aria-live="polite"
      className={cn(
        "scroll-slim block max-h-[34rem] w-full overflow-auto rounded-2xl bg-card p-4 font-mono text-sm leading-relaxed",
        className,
      )}
    >
      {empty ? (
        <span className="text-muted-foreground">{placeholder}</span>
      ) : (
        <pre className="whitespace-pre-wrap break-words">
          {tokens.map((token, index) => (
            <span
              key={`${index}-${token.kind}`}
              className={TOKEN_STYLES[token.kind]}
            >
              {token.text}
            </span>
          ))}
        </pre>
      )}
    </output>
  );
}
