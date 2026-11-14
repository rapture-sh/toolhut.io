"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { JsonView } from "~/components/tools/json-view";
import {
  CopyButton,
  ToolField,
  ToolOutput,
  ToolPanes,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import {
  type DecodedJwt,
  decodeJwt,
  describeClaims,
  formatJson,
  JwtDecodeError,
  type JwtValidity,
  tokenValidity,
} from "~/utils/jwt-decoder";

const VALIDITY_LABELS: Record<JwtValidity, string> = {
  valid: "Valid right now",
  expired: "Expired",
  early: "Not valid yet",
  unknown: "No expiry claim",
};

function read(token: string): {
  decoded: DecodedJwt | null;
  error: string | null;
} {
  if (token.trim() === "") {
    return { decoded: null, error: null };
  }

  try {
    return { decoded: decodeJwt(token), error: null };
  } catch (thrown) {
    if (thrown instanceof JwtDecodeError) {
      return { decoded: null, error: thrown.message };
    }
    throw thrown;
  }
}

export function JwtDecoderTool() {
  const [token, setToken] = useState("");
  const [now, setNow] = useState<number | null>(null);

  /** Read beside the token, so a long session never judges expiry on a stale clock. */
  const update = useCallback((value: string) => {
    setToken(value);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const { decoded, error } = useMemo(() => read(token), [token]);
  const validity =
    decoded && now !== null ? tokenValidity(decoded.payload, now) : null;
  const claims =
    decoded && now !== null ? describeClaims(decoded.payload, now) : [];

  return (
    <div className="flex flex-col gap-5">
      <ToolField label="Token">
        <ToolTextarea
          value={token}
          onChange={update}
          placeholder="Paste a JSON web token here"
          pasteFiles
          className="h-40"
        />
      </ToolField>
      <div aria-live="polite" className="flex flex-col gap-3">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {validity ? (
          <Badge
            variant="ghost"
            className={cn(
              "px-3 py-1.5 text-sm",
              validity === "valid" || validity === "unknown"
                ? "bg-tag-crypto/15 text-tag-crypto"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {VALIDITY_LABELS[validity]}
          </Badge>
        ) : null}
        {claims.length > 0 ? (
          <dl className="divide-y divide-border rounded-2xl bg-card">
            {claims.map((row) => (
              <div
                key={row.claim}
                className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4"
              >
                <dt className="shrink-0 text-sm text-muted-foreground sm:w-44">
                  {row.label}
                </dt>
                <dd className="flex min-w-0 flex-col gap-0.5 text-sm">
                  <span className="break-words font-mono">{row.value}</span>
                  {row.note ? (
                    <span
                      className={
                        row.problem
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {row.note}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      <ToolPanes>
        <ToolField
          label="Header"
          action={
            <CopyButton value={decoded ? formatJson(decoded.header) : ""} />
          }
        >
          <JsonView
            value={decoded?.header}
            empty={!decoded}
            placeholder="The header appears here."
          />
        </ToolField>
        <ToolField
          label="Payload"
          action={
            <CopyButton value={decoded ? formatJson(decoded.payload) : ""} />
          }
        >
          <JsonView
            value={decoded?.payload}
            empty={!decoded}
            placeholder="The payload appears here."
          />
        </ToolField>
      </ToolPanes>
      <ToolField
        label="Signature"
        action={<CopyButton value={decoded ? decoded.signature : ""} />}
      >
        <ToolOutput
          value={decoded ? decoded.signature : ""}
          placeholder="The signature appears here."
          className="h-auto min-h-16"
        />
      </ToolField>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The signature is shown as the opaque string it is. This tool does not
        verify it, because verifying needs the key, which only your server has.
        Decoding happens in this tab, so the token is never sent anywhere.
      </p>
    </div>
  );
}
