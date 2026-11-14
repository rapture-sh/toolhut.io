"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  CopyButton,
  ToolField,
  ToolOptions,
  ToolOutput,
} from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { generateUuids } from "~/utils/uuid";

export function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [values, setValues] = useState<string[]>([]);

  // Generated on the client, so the markup the server sent never disagrees.
  const generate = useCallback(() => {
    setValues(generateUuids(count));
  }, [count]);

  useEffect(() => {
    generate();
  }, [generate]);

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <label htmlFor="uuid-count" className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">How many</span>
          <Input
            id="uuid-count"
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            className="h-10 w-24 rounded-full bg-card px-4"
          />
        </label>
        <Button type="button" variant="secondary" size="sm" onClick={generate}>
          <RefreshCw />
          Generate
        </Button>
      </ToolOptions>
      <ToolField
        label="UUID v4"
        action={<CopyButton value={values.join("\n")} />}
      >
        <ToolOutput value={values.join("\n")} className="h-96" />
      </ToolField>
    </div>
  );
}
