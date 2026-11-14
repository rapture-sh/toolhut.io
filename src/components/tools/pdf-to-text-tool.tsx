"use client";

import { useEffect, useMemo, useState } from "react";
import { PdfInput } from "~/components/tools/pdf-input";
import { FileActions } from "~/components/tools/tool-actions";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
  ToolOutput,
} from "~/components/tools/tool-io";
import { usePdfFile } from "~/hooks/use-pdf-file";
import { PdfReadError, pageText } from "~/lib/pdf/document";
import {
  isLikelyScanned,
  joinPages,
  PAGE_SEPARATORS,
  type PageSeparator,
  textName,
  wordCount,
} from "~/utils/pdf-to-text";

export function PdfToTextTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [separator, setSeparator] = useState<PageSeparator>("blank");
  const [pages, setPages] = useState<string[]>([]);
  const [read, setRead] = useState(0);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const file = files[0] ?? null;
  const { pdf, pages: total, error: loadError, loading } = usePdfFile(file);

  useEffect(() => {
    setPages([]);
    setRead(0);
    setError(null);

    if (!pdf) {
      setReading(false);
      return;
    }

    let cancelled = false;
    setReading(true);

    const extract = async () => {
      const collected: string[] = [];

      try {
        for (let page = 1; page <= pdf.numPages; page += 1) {
          const text = await pageText(pdf, page);

          if (cancelled) {
            return;
          }

          collected.push(text);
          setPages([...collected]);
          setRead(page);
        }
      } catch (thrown) {
        if (!cancelled) {
          setError(
            thrown instanceof PdfReadError
              ? thrown.message
              : "The text in that PDF could not be read.",
          );
        }
      } finally {
        if (!cancelled) {
          setReading(false);
        }
      }
    };

    void extract();

    return () => {
      cancelled = true;
    };
  }, [pdf]);

  const text = useMemo(
    () => joinPages(pages, { separator }),
    [pages, separator],
  );
  const words = useMemo(
    () => wordCount(joinPages(pages, { separator: "blank" })),
    [pages],
  );
  const scanned = !reading && pages.length > 0 && isLikelyScanned(pages);

  const output = () => {
    if (!file || text === "") {
      return null;
    }

    return {
      blob: new Blob([text], { type: "text/plain;charset=utf-8" }),
      name: textName(file.name),
    };
  };

  return (
    <div className="flex flex-col gap-5">
      <PdfInput
        files={files}
        onFiles={setFiles}
        error={error ?? loadError}
        hint="Every page is read in this tab, so the file stays with you."
      />
      {loading && (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Opening the document.
        </p>
      )}
      {total > 0 && (
        <>
          <ToolOptions>
            <Segmented
              label="Between pages"
              value={separator}
              options={PAGE_SEPARATORS}
              onChange={setSeparator}
            />
          </ToolOptions>
          {scanned && (
            <p className="rounded-2xl bg-tag-pdf/15 p-4 text-sm leading-relaxed text-tag-pdf">
              This PDF holds next to no text, so it is almost certainly a scan:
              the words are pixels in a picture of the page. Reading them takes
              OCR, which this tool does not do.
            </p>
          )}
          <ToolField label="Text" action={<CopyButton value={text} />}>
            <ToolOutput
              value={text}
              placeholder="The words from the PDF appear here."
              className="h-96"
            />
          </ToolField>
          <ToolOptions className="justify-between">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {reading
                ? `Reading page ${read} of ${total}.`
                : `${words} ${words === 1 ? "word" : "words"} from ${total} ${
                    total === 1 ? "page" : "pages"
                  }.`}
            </p>
            <FileActions file={output} disabled={text === ""} />
          </ToolOptions>
        </>
      )}
    </div>
  );
}
