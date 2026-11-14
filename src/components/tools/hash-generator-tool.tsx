"use client";

import { useEffect, useState } from "react";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
  ToolOutput,
  ToolTextarea,
} from "~/components/tools/tool-io";
import {
  HASH_ALGORITHMS,
  type HashAlgorithm,
  hashBytes,
  hashText,
} from "~/utils/hash";

const ALGORITHMS = HASH_ALGORITHMS.map((algorithm) => ({
  value: algorithm,
  label: algorithm.replace("SHA-", "SHA"),
}));

export function HashGeneratorTool() {
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [text, setText] = useState("");
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(
    null,
  );
  const [digest, setDigest] = useState("");

  useEffect(() => {
    let current = true;

    const run = async () => {
      const value = file
        ? await hashBytes(file.bytes, algorithm)
        : text === ""
          ? ""
          : await hashText(text, algorithm);

      if (current) {
        setDigest(value);
      }
    };

    void run();

    return () => {
      current = false;
    };
  }, [algorithm, text, file]);

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="Algorithm"
          value={algorithm}
          options={ALGORITHMS}
          onChange={setAlgorithm}
        />
      </ToolOptions>

      <ToolField
        label="Text"
        action={
          <label className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground">
            {file ? `${file.name}, clear` : "or hash a file"}
            <input
              type="file"
              className="sr-only"
              onChange={async (event) => {
                const picked = event.target.files?.[0];
                if (!picked) {
                  setFile(null);
                  return;
                }
                setFile({
                  name: picked.name,
                  bytes: new Uint8Array(await picked.arrayBuffer()),
                });
              }}
            />
          </label>
        }
      >
        <ToolTextarea
          value={text}
          onChange={(value) => {
            setFile(null);
            setText(value);
          }}
          placeholder="Type or paste what you want hashed"
          rows={8}
        />
      </ToolField>

      <ToolField label="Digest" action={<CopyButton value={digest} />}>
        <ToolOutput
          value={digest}
          placeholder="The hex digest appears here."
          className="min-h-20"
        />
      </ToolField>
    </div>
  );
}
