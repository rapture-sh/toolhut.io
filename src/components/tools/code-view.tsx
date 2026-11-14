"use client";

import { useMemo } from "react";
import { useToolField } from "~/components/tools/tool-io";
import { cn } from "~/lib/utils";
import {
  type HighlightLanguage,
  type TokenKind,
  tokenise,
} from "~/utils/highlight";

const TOKEN_STYLES: Record<TokenKind, string> = {
  key: "text-primary",
  attribute: "text-primary",
  string: "text-tag-web",
  number: "text-tag-data",
  boolean: "text-tag-time",
  type: "text-tag-time",
  null: "text-tag-color",
  keyword: "text-tag-text",
  tag: "text-tag-dev",
  comment: "text-muted-foreground italic",
  punctuation: "text-muted-foreground",
  plain: "",
};

/** Past this, colouring every piece costs more than it gives. */
const MAX_HIGHLIGHT = 200_000;

interface CodeViewProps {
  value: string;
  language?: HighlightLanguage;
  error?: string | null;
  placeholder?: string;
  /** Grow with the content instead of standing at the shared field height. */
  fit?: boolean;
  className?: string;
}

/**
 * Output that is code, with its parts coloured. Every tool that prints JSON,
 * YAML, TOML, XML, SQL or TypeScript shows it through this, so they all read
 * the same way.
 */
export function CodeView({
  value,
  language = "plain",
  error,
  placeholder = "The result appears here.",
  fit = false,
  className,
}: CodeViewProps) {
  const field = useToolField();

  const tokens = useMemo(
    () => (value.length > MAX_HIGHLIGHT ? [] : tokenise(value, language)),
    [value, language],
  );

  return (
    <output
      id={field?.id}
      aria-labelledby={field?.labelId}
      aria-live="polite"
      className={cn(
        "scroll-slim block w-full overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-card p-4 font-mono text-sm leading-relaxed",
        fit ? "max-h-[34rem]" : "h-72",
        className,
      )}
    >
      {error ? (
        <span className="text-destructive">{error}</span>
      ) : value === "" ? (
        <span className="text-muted-foreground">{placeholder}</span>
      ) : tokens.length === 0 ? (
        value
      ) : (
        tokens.map((token, index) => (
          <span
            key={`${index}-${token.kind}`}
            className={TOKEN_STYLES[token.kind]}
          >
            {token.text}
          </span>
        ))
      )}
    </output>
  );
}
