"use client";

import { useEffect, useState } from "react";
import { PdfInput } from "~/components/tools/pdf-input";
import { FileActions } from "~/components/tools/tool-actions";
import { ToolField } from "~/components/tools/tool-io";
import { usePdfFile } from "~/hooks/use-pdf-file";
import {
  loadPdf,
  type PdfMetadata,
  PdfWriteError,
  savePdf,
  stripMetadata,
} from "~/lib/pdf/build";
import {
  cleanName,
  hasMetadata,
  metadataFromInfo,
  metadataRows,
} from "~/utils/pdf-metadata";

/**
 * A PDF always carries a creation and a modification date, and stripping
 * cannot delete them, so they are pinned here instead of saying when the
 * details were taken out.
 */
const PINNED = new Date(0);

export function PdfMetadataTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const file = files[0] ?? null;
  const { pdf, pages, error: loadError, loading } = usePdfFile(file);

  useEffect(() => {
    setMetadata(null);
    setError(null);

    if (!pdf) {
      return;
    }

    let cancelled = false;

    pdf
      .getMetadata()
      .then(({ info }) => {
        if (!cancelled) {
          setMetadata(metadataFromInfo(info));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("The details in that PDF could not be read.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pdf]);

  const rows = metadata ? metadataRows(metadata) : [];
  const carries = metadata !== null && hasMetadata(metadata);

  const cleanCopy = async () => {
    if (!file) {
      return null;
    }

    try {
      const copy = await loadPdf(file);
      stripMetadata(copy);
      copy.setCreationDate(PINNED);
      copy.setModificationDate(PINNED);

      return { blob: await savePdf(copy), name: cleanName(file.name) };
    } catch (thrown) {
      setError(
        thrown instanceof PdfWriteError
          ? thrown.message
          : "That PDF could not be written again without its details.",
      );

      return null;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PdfInput
        files={files}
        onFiles={setFiles}
        error={error ?? loadError}
        hint="The document is read in this tab, so the file stays with you."
      />
      <div aria-live="polite" className="flex flex-col gap-4">
        {loading && (
          <p className="text-sm text-muted-foreground">Opening the document.</p>
        )}
        {metadata !== null && !carries && (
          <p className="rounded-2xl bg-card p-4 text-sm leading-relaxed text-muted-foreground">
            This PDF says nothing about itself. There is no title, no author and
            no date in it, which is what you want before you send it on.
          </p>
        )}
        {rows.length > 0 && carries && (
          <section className="rounded-2xl bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 className="text-sm font-medium">Details</h2>
              <p className="text-sm text-muted-foreground">
                {pages === 1 ? "1 page" : `${pages} pages`}
              </p>
            </div>
            <dl className="mt-2 flex flex-col">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 py-1.5"
                >
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 break-words font-mono text-sm">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
      <ToolField
        label="Download without the details"
        action={
          <FileActions copyable={false} disabled={!pdf} file={cleanCopy} />
        }
      >
        <p className="rounded-2xl bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          The clean copy is the document written again: every page comes out as
          it was, the title, the author, the subject, the keywords and the
          software come out empty, and both dates are pinned to 1970 because a
          PDF always carries one.
        </p>
      </ToolField>
    </div>
  );
}
