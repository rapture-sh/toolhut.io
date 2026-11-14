"use client";

import { Upload } from "lucide-react";
import {
  type DragEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "~/lib/utils";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  /** Says what this field takes, so the overlay can be specific. */
  label?: string;
  /** Also take a file from Ctrl+V. Only one zone per page should ask. */
  paste?: boolean;
  className?: string;
  children: ReactNode;
}

function carriesFiles(event: DragEvent<HTMLElement>): boolean {
  return Array.from(event.dataTransfer.types).includes("Files");
}

/**
 * Wraps any field so a file can be dropped on it, with an overlay that says
 * so while the file is over it.
 */
export function DropZone({
  onFiles,
  label = "Drop a file here",
  paste = false,
  className,
  children,
}: DropZoneProps) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);

  useEffect(() => {
    if (!paste) {
      return;
    }

    function handlePaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files ?? []);

      if (files.length > 0) {
        event.preventDefault();
        onFiles(files);
      }
    }

    window.addEventListener("paste", handlePaste);

    return () => window.removeEventListener("paste", handlePaste);
  }, [onFiles, paste]);

  const onDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!carriesFiles(event)) {
      return;
    }
    depth.current += 1;
    setOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) {
      setOver(false);
    }
  }, []);

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (carriesFiles(event)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (!carriesFiles(event)) {
        return;
      }

      event.preventDefault();
      depth.current = 0;
      setOver(false);

      const files = Array.from(event.dataTransfer.files);
      if (files.length > 0) {
        onFiles(files);
      }
    },
    [onFiles],
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the field inside keeps the focus and the keyboard, this wrapper only catches a dragged file
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn("relative isolate", className)}
    >
      {children}
      {over && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl bg-card ring-2 ring-primary ring-inset"
        >
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-primary/10">
            <Upload className="size-6 text-primary" strokeWidth={1.8} />
            <span className="text-sm font-medium text-primary">{label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
