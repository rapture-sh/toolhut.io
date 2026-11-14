"use client";

import { MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImageInput } from "~/components/tools/image-input";
import { FileActions } from "~/components/tools/tool-actions";
import { ToolField } from "~/components/tools/tool-io";
import { useImageFile } from "~/hooks/use-image-file";
import { canvasToBlob, toCanvas } from "~/lib/image/canvas";
import {
  cleanCopyName,
  hasLocation,
  MetadataError,
  type MetadataTags,
  summariseTags,
} from "~/utils/exif-viewer";
import { formatForType } from "~/utils/image-format";

/** JPEG has no alpha, so a transparent source needs something behind it. */
const FLATTEN = "#ffffff";

export function ExifViewerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<MetadataTags | null>(null);
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const { bitmap, url, error: loadError } = useImageFile(file);

  useEffect(() => {
    if (!file) {
      setTags(null);
      setReadError(null);
      setReading(false);
      return;
    }

    let cancelled = false;

    setTags(null);
    setReadError(null);
    setReading(true);

    const run = async () => {
      try {
        const [buffer, ExifReader] = await Promise.all([
          file.arrayBuffer(),
          import("exifreader"),
        ]);

        if (cancelled) {
          return;
        }

        try {
          setTags(ExifReader.load(buffer, { expanded: true }));
        } catch (thrown) {
          if (thrown instanceof ExifReader.errors.MetadataMissingError) {
            setTags({});
          } else {
            setReadError("The metadata in that file could not be read.");
          }
        }
      } catch {
        if (!cancelled) {
          setReadError("That file could not be read.");
        }
      } finally {
        if (!cancelled) {
          setReading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [file]);

  const summary = useMemo(() => {
    if (!tags) {
      return { groups: [], error: null };
    }

    try {
      return { groups: summariseTags(tags), error: null };
    } catch (thrown) {
      if (thrown instanceof MetadataError) {
        return { groups: [], error: thrown.message };
      }
      throw thrown;
    }
  }, [tags]);

  const located = tags !== null && hasLocation(tags);

  const cleanCopy = async () => {
    if (!file || !bitmap) {
      return null;
    }

    const format = formatForType(file.type) ?? "png";
    const canvas = toCanvas(
      bitmap,
      bitmap.width,
      bitmap.height,
      format === "jpeg" ? FLATTEN : undefined,
    );

    return {
      blob: await canvasToBlob(canvas, format, 0.92),
      name: cleanCopyName(file.name, format),
    };
  };

  return (
    <div className="flex flex-col gap-5">
      <ImageInput
        file={file}
        onFile={setFile}
        url={url}
        error={loadError}
        hint="A photo straight from a camera or a phone, usually a JPEG. It never leaves your browser."
      />
      <div aria-live="polite" className="flex flex-col gap-4">
        {readError && <p className="text-sm text-destructive">{readError}</p>}
        {summary.error && (
          <p className="text-sm text-destructive">{summary.error}</p>
        )}
        {reading && (
          <p className="text-sm text-muted-foreground">
            Reading what this photo carries.
          </p>
        )}
        {located && (
          <p className="flex items-start gap-2 rounded-2xl bg-tag-image/15 p-4 text-sm leading-relaxed text-tag-image">
            <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
            <span>
              This photo says where it was taken. Anyone you send the file to
              can read that position, so strip it before you post the photo.
            </span>
          </p>
        )}
        {tags !== null && summary.groups.length === 0 && !summary.error && (
          <p className="rounded-2xl bg-card p-4 text-sm leading-relaxed text-muted-foreground">
            This file carries no metadata at all. There is no camera, no date
            and no position in it, which is what you want if you are about to
            share it.
          </p>
        )}
        {summary.groups.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {summary.groups.map((group) => (
              <section key={group.title} className="rounded-2xl bg-card p-4">
                <h2 className="text-sm font-medium">{group.title}</h2>
                <dl className="mt-2 flex flex-col">
                  {group.rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-wrap items-baseline justify-between gap-x-4 py-1.5"
                    >
                      <dt className="text-sm text-muted-foreground">
                        {row.label}
                      </dt>
                      <dd className="min-w-0 break-words font-mono text-sm">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}
      </div>
      <ToolField
        label="Clean copy"
        action={<FileActions image disabled={!bitmap} file={cleanCopy} />}
      >
        <p className="rounded-2xl bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          The clean copy is drawn onto a canvas and encoded again, which is the
          one way a browser can write an image: the pixels come out the same and
          every tag, including the position, is left behind. A JPEG is saved at
          high quality rather than copied byte for byte, so expect the file size
          to move a little.
        </p>
      </ToolField>
    </div>
  );
}
