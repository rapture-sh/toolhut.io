"use client";

import { ImagePlus, X } from "lucide-react";
import { useId, useRef } from "react";
import { DropZone } from "~/components/tools/drop-zone";
import { Button } from "~/components/ui/button";
import { isImageFile } from "~/lib/read-file";
import { cn } from "~/lib/utils";
import { formatBytes } from "~/utils/bytes";

interface ImageInputProps {
  file: File | null;
  onFile: (file: File | null) => void;
  /** The preview URL from `useImageFile`, so the image is decoded once. */
  url?: string | null;
  error?: string | null;
  /** Extra line in the empty state, such as which formats a tool reads. */
  hint?: string;
  /** Off when the tool draws the picture itself, so it is not shown twice. */
  preview?: boolean;
  className?: string;
}

/** The way every image tool takes its picture: drop, paste or choose. */
export function ImageInput({
  file,
  onFile,
  url,
  error,
  hint,
  preview = true,
  className,
}: ImageInputProps) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);

  const take = (files: File[]) => {
    const image = files.find(isImageFile);
    if (image) {
      onFile(image);
    }
  };

  return (
    <DropZone onFiles={take} label="Drop an image here" paste>
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center gap-4 rounded-2xl bg-card p-6",
          file && !preview ? "min-h-0 py-3" : "min-h-72",
          className,
        )}
      >
        <input
          ref={input}
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const picked = event.target.files?.[0];
            if (picked) {
              onFile(picked);
            }
            event.target.value = "";
          }}
        />
        {file && url ? (
          <>
            {preview && (
              <img
                src={url}
                alt={file.name}
                className="max-h-80 w-auto max-w-full rounded-xl object-contain"
              />
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="max-w-60 truncate font-medium text-foreground">
                {file.name}
              </span>
              <span>{formatBytes(file.size)}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => input.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove the image"
                onClick={() => onFile(null)}
              >
                <X />
              </Button>
            </div>
          </>
        ) : (
          <>
            <ImagePlus
              className="size-8 text-muted-foreground"
              strokeWidth={1.5}
            />
            <div className="text-center">
              <p className="font-medium">Drop an image, or paste it</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hint ?? "It never leaves your browser."}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => input.current?.click()}
            >
              Choose a file
            </Button>
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </DropZone>
  );
}
