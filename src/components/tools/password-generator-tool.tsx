"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CopyButton,
  ToolField,
  ToolOptions,
  ToolOutput,
  ToolSlider,
} from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  generatePassword,
  PASSWORD_LENGTH_RANGE,
  PasswordOptionsError,
  passwordStrength,
} from "~/utils/password-generator";

type SetName = "lowercase" | "uppercase" | "digits" | "symbols";

const SETS: { name: SetName; label: string }[] = [
  { name: "lowercase", label: "Lowercase a-z" },
  { name: "uppercase", label: "Uppercase A-Z" },
  { name: "digits", label: "Digits 0-9" },
  { name: "symbols", label: "Symbols" },
];

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(20);
  const [sets, setSets] = useState<Record<SetName, boolean>>({
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
  });
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Generated on the client, so the markup the server sent never disagrees.
  const generate = useCallback(() => {
    try {
      setPassword(generatePassword({ length, avoidAmbiguous, ...sets }));
      setError(null);
    } catch (thrown) {
      if (thrown instanceof PasswordOptionsError) {
        setPassword("");
        setError(thrown.message);
        return;
      }
      throw thrown;
    }
  }, [length, avoidAmbiguous, sets]);

  useEffect(() => {
    generate();
  }, [generate]);

  const strength = useMemo(() => passwordStrength(password), [password]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-2xl bg-card p-4 sm:p-5">
        <ToolSlider
          label="Length"
          value={length}
          min={PASSWORD_LENGTH_RANGE.min}
          max={PASSWORD_LENGTH_RANGE.max}
          display={`${length} characters`}
          onChange={setLength}
        />
        <ToolOptions className="gap-x-5 gap-y-3">
          {SETS.map((set) => (
            <label
              key={set.name}
              htmlFor={`password-${set.name}`}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground"
            >
              <Checkbox
                id={`password-${set.name}`}
                checked={sets[set.name]}
                onCheckedChange={(checked) =>
                  setSets((current) => ({
                    ...current,
                    [set.name]: checked === true,
                  }))
                }
              />
              {set.label}
            </label>
          ))}
          <label
            htmlFor="password-ambiguous"
            className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground"
          >
            <Checkbox
              id="password-ambiguous"
              checked={avoidAmbiguous}
              onCheckedChange={(checked) => setAvoidAmbiguous(checked === true)}
            />
            Avoid lookalike characters
          </label>
        </ToolOptions>
      </div>
      <ToolField
        label="Password"
        action={
          <div className="flex items-center gap-1">
            <CopyButton value={password} />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={generate}
            >
              <RefreshCw />
              Regenerate
            </Button>
          </div>
        }
      >
        <ToolOutput
          value={password}
          error={error}
          placeholder="Turn a character set on to get a password."
          className="h-auto min-h-24 text-xl leading-relaxed sm:text-2xl"
        />
      </ToolField>
      <p
        className="text-sm leading-relaxed text-muted-foreground"
        aria-live="polite"
      >
        {password === ""
          ? "No password yet."
          : `${strength.bits} bits of entropy, from an alphabet of ${strength.alphabet} characters. That is ${strength.label}.`}
      </p>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Drawn from the browser's own random source. Nothing is sent anywhere,
        and reloading the page is enough to forget it.
      </p>
    </div>
  );
}
