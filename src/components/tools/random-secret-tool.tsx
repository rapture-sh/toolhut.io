"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
  ToolOutput,
} from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { generateSecret, type SecretFormat } from "~/utils/random-secret";

const FORMATS = [
  { value: "hex" as const, label: "Hex" },
  { value: "base64" as const, label: "Base64" },
  { value: "base64url" as const, label: "Base64 URL" },
];

export function RandomSecretTool() {
  const [bytes, setBytes] = useState(32);
  const [format, setFormat] = useState<SecretFormat>("hex");
  const [secret, setSecret] = useState("");

  // Generated on the client, so the markup the server sent never disagrees.
  const generate = useCallback(() => {
    setSecret(generateSecret(bytes, format));
  }, [bytes, format]);

  useEffect(() => {
    generate();
  }, [generate]);

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="Format"
          value={format}
          options={FORMATS}
          onChange={setFormat}
        />
        <label
          htmlFor="secret-bytes"
          className="flex items-center gap-2 text-sm"
        >
          <span className="text-muted-foreground">Bytes</span>
          <Input
            id="secret-bytes"
            type="number"
            min={1}
            max={512}
            value={bytes}
            onChange={(event) => setBytes(Number(event.target.value))}
            className="h-10 w-24 rounded-full bg-card px-4"
          />
        </label>
        <Button type="button" variant="secondary" size="sm" onClick={generate}>
          <RefreshCw />
          Generate
        </Button>
      </ToolOptions>
      <ToolField label="Secret" action={<CopyButton value={secret} />}>
        <ToolOutput value={secret} className="min-h-24" />
      </ToolField>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Generated with the browser's own random source. Nothing is sent
        anywhere, and reloading the page is enough to forget it.
      </p>
    </div>
  );
}
