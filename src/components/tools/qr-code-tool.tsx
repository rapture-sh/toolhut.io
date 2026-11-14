"use client";

import { useId, useMemo, useState } from "react";
import { FileActions, type OutputFile } from "~/components/tools/tool-actions";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
  ToolOutput,
  ToolPanes,
  ToolSlider,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { canvasToBlob } from "~/lib/image/canvas";
import {
  EMPTY_QR_FIELDS,
  type QrFields,
  QrInputError,
  type QrKind,
  type QrLevel,
  type QrMatrix,
  qrFieldsEmpty,
  qrInputFor,
  qrMatrix,
  qrPath,
  qrSvg,
  type WifiSecurity,
} from "~/utils/qr-code";

const KINDS = [
  { value: "text" as const, label: "Text" },
  { value: "url" as const, label: "URL" },
  { value: "wifi" as const, label: "Wifi" },
  { value: "email" as const, label: "Email" },
];

const LEVELS = [
  { value: "L" as const, label: "L" },
  { value: "M" as const, label: "M" },
  { value: "Q" as const, label: "Q" },
  { value: "H" as const, label: "H" },
];

const SECURITIES = [
  { value: "WPA" as const, label: "WPA" },
  { value: "WEP" as const, label: "WEP" },
  { value: "nopass" as const, label: "None" },
];

interface Built {
  payload: string;
  matrix: QrMatrix | null;
  error: string | null;
}

function build(kind: QrKind, fields: QrFields, level: QrLevel): Built {
  if (qrFieldsEmpty(kind, fields)) {
    return { payload: "", matrix: null, error: null };
  }

  try {
    const payload = qrInputFor(kind, fields);

    return { payload, matrix: qrMatrix(payload, { level }), error: null };
  } catch (error) {
    if (error instanceof QrInputError) {
      return { payload: "", matrix: null, error: error.message };
    }
    throw error;
  }
}

/**
 * The SVG goes through an image and a canvas, which is the only way a browser
 * will rasterise one. Nothing leaves the page: the SVG travels as a data URL.
 */
async function toPng(svg: string, size: number): Promise<Blob | null> {
  const image = new Image(size, size);
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  try {
    await image.decode();
  } catch {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.drawImage(image, 0, 0, size, size);

  return await canvasToBlob(canvas, "png");
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url" | "email";
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: TextFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function QrCodeTool() {
  const [kind, setKind] = useState<QrKind>("url");
  const [level, setLevel] = useState<QrLevel>("M");
  const [size, setSize] = useState(512);
  const [fields, setFields] = useState<QrFields>(EMPTY_QR_FIELDS);
  const textId = useId();
  const hiddenId = useId();

  const { payload, matrix, error } = useMemo(
    () => build(kind, fields, level),
    [kind, fields, level],
  );

  const set = (patch: Partial<QrFields>) => {
    setFields((current) => ({ ...current, ...patch }));
  };

  const svgFile = (): OutputFile | null => {
    if (payload === "") {
      return null;
    }

    return {
      blob: new Blob([qrSvg(payload, { level, size })], {
        type: "image/svg+xml;charset=utf-8",
      }),
      name: "qr-code.svg",
    };
  };

  const pngFile = async (): Promise<OutputFile | null> => {
    if (payload === "") {
      return null;
    }

    const blob = await toPng(qrSvg(payload, { level, size }), size);

    return blob ? { blob, name: "qr-code.png" } : null;
  };

  return (
    <div className="flex flex-col gap-5">
      <Segmented label="Kind" value={kind} options={KINDS} onChange={setKind} />
      <ToolPanes>
        <div className="flex flex-col gap-4">
          {kind === "text" && (
            <div className="flex flex-col gap-2">
              <label htmlFor={textId} className="text-sm font-medium">
                Text
              </label>
              <ToolTextarea
                id={textId}
                value={fields.text}
                onChange={(text) => set({ text })}
                placeholder="Paste text here"
                className="h-44"
              />
            </div>
          )}
          {kind === "url" && (
            <TextField
              label="Link"
              type="url"
              value={fields.url}
              onChange={(url) => set({ url })}
              placeholder="toolhut.io"
            />
          )}
          {kind === "wifi" && (
            <>
              <TextField
                label="Network name"
                value={fields.ssid}
                onChange={(ssid) => set({ ssid })}
                placeholder="Coffee shop"
              />
              {fields.security !== "nopass" && (
                <TextField
                  label="Password"
                  value={fields.password}
                  onChange={(password) => set({ password })}
                  placeholder="The wifi password"
                />
              )}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Security</span>
                <Segmented
                  label="Security"
                  value={fields.security}
                  options={SECURITIES}
                  onChange={(security: WifiSecurity) => set({ security })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={hiddenId}
                  checked={fields.hidden}
                  onCheckedChange={(checked) =>
                    set({ hidden: checked === true })
                  }
                />
                <label htmlFor={hiddenId} className="text-sm">
                  The network is hidden
                </label>
              </div>
            </>
          )}
          {kind === "email" && (
            <>
              <TextField
                label="Email address"
                type="email"
                value={fields.address}
                onChange={(address) => set({ address })}
                placeholder="hello@toolhut.io"
              />
              <TextField
                label="Subject"
                value={fields.subject}
                onChange={(subject) => set({ subject })}
                placeholder="Optional"
              />
              <TextField
                label="Message"
                value={fields.body}
                onChange={(body) => set({ body })}
                placeholder="Optional"
              />
            </>
          )}
          <ToolOptions>
            <Segmented
              label="Error correction"
              value={level}
              options={LEVELS}
              onChange={setLevel}
            />
            <ToolSlider
              label="Size"
              value={size}
              min={128}
              max={1024}
              step={32}
              display={`${size} px`}
              onChange={setSize}
            />
          </ToolOptions>
          <ToolField label="Encoded as" action={<CopyButton value={payload} />}>
            <ToolOutput
              value={payload}
              error={error}
              placeholder="Fill in a field and the QR code appears."
              className="h-auto min-h-20"
            />
          </ToolField>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex min-h-72 items-center justify-center rounded-2xl bg-card p-6">
            {matrix ? (
              <svg
                role="img"
                aria-label="QR code"
                viewBox={`0 0 ${matrix.size} ${matrix.size}`}
                shapeRendering="crispEdges"
                className="h-auto w-full max-w-72"
              >
                <title>QR code</title>
                <rect width={matrix.size} height={matrix.size} fill="white" />
                <path fill="black" d={qrPath(matrix)} />
              </svg>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing to encode yet.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">SVG</span>
            <FileActions file={svgFile} disabled={payload === ""} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">PNG</span>
            <FileActions file={pngFile} image disabled={payload === ""} />
          </div>
        </div>
      </ToolPanes>
    </div>
  );
}
