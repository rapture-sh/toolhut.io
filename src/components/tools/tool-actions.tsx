"use client";

import { Check, Copy, Download } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { copyImage } from "~/lib/clipboard";
import { downloadBlob } from "~/lib/download";
import { cn } from "~/lib/utils";

export interface OutputFile {
  blob: Blob;
  name: string;
}

interface FileActionsProps {
  /** Builds the file on demand, or returns null while there is nothing yet. */
  file: () => Promise<OutputFile | null> | OutputFile | null;
  /** An image goes on the clipboard as a PNG, which is all browsers take. */
  image?: boolean;
  /** Off for a PDF or a zip, which no clipboard can hold. */
  copyable?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Download and copy, side by side. Every tool that produces a file offers
 * both, so nothing has to go through the file system to be useful.
 */
export function FileActions({
  file,
  image = false,
  copyable = true,
  disabled = false,
  className,
}: FileActionsProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const download = useCallback(async () => {
    setBusy(true);
    try {
      const output = await file();
      if (output) {
        downloadBlob(output.blob, output.name);
      }
    } finally {
      setBusy(false);
    }
  }, [file]);

  const copy = useCallback(async () => {
    setBusy(true);
    try {
      const output = await file();
      if (!output) {
        return;
      }

      const done = image
        ? await copyImage(output.blob)
        : await navigator.clipboard
            .writeText(await output.blob.text())
            .then(() => true)
            .catch(() => false);

      if (!done) {
        return;
      }

      setCopied(true);
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => setCopied(false), 2000);
    } finally {
      setBusy(false);
    }
  }, [file, image]);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {copyable && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || busy}
          onClick={copy}
          aria-label={image ? "Copy as PNG" : "Copy"}
          className="text-muted-foreground"
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled || busy}
        onClick={download}
        className="text-muted-foreground"
      >
        <Download />
        Download
      </Button>
    </div>
  );
}
