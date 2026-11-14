"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageInput } from "~/components/tools/image-input";
import { FileActions } from "~/components/tools/tool-actions";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
  ToolOutput,
  ToolPanes,
} from "~/components/tools/tool-io";
import { formatBytes } from "~/utils/bytes";
import {
  type Base64View,
  DataUriError,
  dataUri,
  encodedFileName,
  encodedSize,
  renderBase64,
} from "~/utils/image-to-base64";

const VIEWS = [
  { value: "uri" as const, label: "Data URI" },
  { value: "css" as const, label: "CSS" },
  { value: "html" as const, label: "HTML" },
];

export function ImageToBase64Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [view, setView] = useState<Base64View>("uri");
  const [payload, setPayload] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPayload(null);
      setUrl(null);
      setReadError(null);
      return;
    }

    let cancelled = false;
    const objectUrl = URL.createObjectURL(file);
    const reader = new FileReader();

    setUrl(objectUrl);
    setPayload(null);
    setReadError(null);

    reader.onload = () => {
      if (cancelled) {
        return;
      }
      const text = typeof reader.result === "string" ? reader.result : "";
      const comma = text.indexOf(",");
      setPayload(comma === -1 ? "" : text.slice(comma + 1));
    };

    reader.onerror = () => {
      if (!cancelled) {
        setReadError("That file could not be read.");
      }
    };

    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
      reader.abort();
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const output = useMemo(() => {
    if (!file || payload === null) {
      return { value: "", error: null };
    }

    try {
      return {
        value: renderBase64(view, dataUri(file.type, payload), file.name),
        error: null,
      };
    } catch (thrown) {
      if (thrown instanceof DataUriError) {
        return { value: "", error: thrown.message };
      }
      throw thrown;
    }
  }, [file, payload, view]);

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="Give me"
          value={view}
          options={VIEWS}
          onChange={setView}
        />
        <FileActions
          disabled={output.value === ""}
          file={() =>
            file && output.value !== ""
              ? {
                  blob: new Blob([output.value], {
                    type: "text/plain;charset=utf-8",
                  }),
                  name: encodedFileName(file.name),
                }
              : null
          }
        />
      </ToolOptions>
      <ToolPanes>
        <ToolField label="Image">
          <ImageInput
            file={file}
            onFile={setFile}
            url={url}
            error={readError}
            hint="PNG, JPEG, WebP, GIF or SVG. It never leaves your browser."
          />
        </ToolField>
        <ToolField
          label={view === "uri" ? "Data URI" : view === "css" ? "CSS" : "HTML"}
          action={<CopyButton value={output.value} />}
        >
          <ToolOutput
            value={output.value}
            error={output.error}
            placeholder="The data URI appears here."
            className="text-xs"
          />
        </ToolField>
      </ToolPanes>
      {file && (
        <p
          aria-live="polite"
          className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm text-muted-foreground tabular-nums"
        >
          <span>{formatBytes(file.size)} on disk</span>
          <span aria-hidden="true">to</span>
          <span className="text-foreground">
            {formatBytes(encodedSize(file.size))} of base64
          </span>
        </p>
      )}
      <p className="text-sm leading-relaxed text-muted-foreground">
        Base64 carries three bytes in four characters, so a data URI is always
        about a third bigger than the file it came from. That is a fair trade
        for a small icon that saves a request, and a poor one for a photo. The
        file is read by this tab alone, so nothing is uploaded.
      </p>
    </div>
  );
}
