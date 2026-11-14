"use client";

import { useCallback, useMemo, useState } from "react";
import { FileActions, type OutputFile } from "~/components/tools/tool-actions";
import {
  Segmented,
  ToolField,
  ToolOutput,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { renderMarkdown } from "~/utils/markdown";

type View = "preview" | "html";

const VIEWS = [
  { value: "preview" as const, label: "Preview" },
  { value: "html" as const, label: "HTML" },
];

const PROSE =
  "[&>*+*]:mt-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-[-0.03em] [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_pre]:overflow-auto [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_hr]:border-border [&_table]:w-full [&_table]:text-left [&_th]:font-semibold [&_td]:align-top [&_img]:max-w-full [&_img]:rounded-xl";

export function MarkdownPreviewTool() {
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>("preview");

  const html = useMemo(() => renderMarkdown(input), [input]);

  const file = useCallback((): OutputFile | null => {
    if (html === "") {
      return null;
    }

    return {
      blob: new Blob([html], { type: "text/html;charset=utf-8" }),
      name: "preview.html",
    };
  }, [html]);

  return (
    <div className="flex flex-col gap-5">
      <Segmented label="View" value={view} options={VIEWS} onChange={setView} />
      <ToolPanes>
        <ToolField label="Markdown">
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder="# Write Markdown here"
            pasteFiles
          />
        </ToolField>
        <ToolField
          label={view === "preview" ? "Preview" : "HTML"}
          action={<FileActions file={file} disabled={html === ""} />}
        >
          {view === "preview" ? (
            <div
              aria-live="polite"
              className="scroll-slim h-72 w-full overflow-auto rounded-2xl bg-card p-4 text-sm leading-relaxed break-words"
            >
              {html === "" ? (
                <p className="font-mono text-muted-foreground">
                  The rendered page appears here.
                </p>
              ) : (
                <div
                  className={PROSE}
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown sanitises the HTML with DOMPurify first
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </div>
          ) : (
            <ToolOutput value={html} placeholder="The HTML appears here." />
          )}
        </ToolField>
      </ToolPanes>
    </div>
  );
}
