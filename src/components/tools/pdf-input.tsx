"use client";

import { FileText, X } from "lucide-react";
import { useId, useRef } from "react";
import { DropZone } from "~/components/tools/drop-zone";
import { Button } from "~/components/ui/button";
import { isPdfFile } from "~/lib/read-file";
import { cn } from "~/lib/utils";
import { formatBytes } from "~/utils/bytes";

interface PdfInputProps {
  files: readonly File[];
  onFiles: (files: File[]) => void;
  /** Take more than one PDF, the way merging needs to. */
  multiple?: boolean;
  error?: string | null;
  hint?: string;
  className?: string;
}

/** The way every PDF tool takes its file: drop, paste or choose. */
export function PdfInput({
  files,
  onFiles,
  multiple = false,
  error,
  hint,
  className,
}: PdfInputProps) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);

  const take = (picked: File[]) => {
    const pdfs = picked.filter(isPdfFile);

    if (pdfs.length === 0) {
      return;
    }

    onFiles(multiple ? [...files, ...pdfs] : [pdfs[0] as File]);
  };

  const remove = (name: string, size: number) => {
    onFiles(files.filter((file) => file.name !== name || file.size !== size));
  };

  return (
    <DropZone
      onFiles={take}
      label={multiple ? "Drop PDFs here" : "Drop a PDF here"}
      paste
    >
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center gap-4 rounded-2xl bg-card p-6",
          files.length > 0 ? "min-h-0 py-4" : "min-h-56",
          className,
        )}
      >
        <input
          ref={input}
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          multiple={multiple}
          className="sr-only"
          onChange={(event) => {
            take(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
        {files.length > 0 ? (
          <>
            <ul className="flex w-full flex-col gap-1">
              {files.map((file) => (
                <li
                  key={`${file.name}-${file.size}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm"
                >
                  <FileText
                    className="size-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.8}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {file.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => remove(file.name, file.size)}
                  >
                    <X />
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => input.current?.click()}
            >
              {multiple ? "Add another" : "Replace"}
            </Button>
          </>
        ) : (
          <>
            <FileText
              className="size-8 text-muted-foreground"
              strokeWidth={1.5}
            />
            <div className="text-center">
              <p className="font-medium">
                {multiple
                  ? "Drop PDFs, or paste them"
                  : "Drop a PDF, or paste it"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hint ?? "It never leaves your browser."}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => input.current?.click()}
            >
              {multiple ? "Choose files" : "Choose a file"}
            </Button>
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </DropZone>
  );
}
