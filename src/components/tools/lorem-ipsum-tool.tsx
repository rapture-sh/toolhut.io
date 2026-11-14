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
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { generateLorem, type LoremUnit } from "~/utils/lorem-ipsum";

const UNITS = [
  { value: "paragraphs" as const, label: "Paragraphs" },
  { value: "sentences" as const, label: "Sentences" },
  { value: "words" as const, label: "Words" },
];

export function LoremIpsumTool() {
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [text, setText] = useState("");

  // Generated on the client, so the markup the server sent never disagrees.
  const generate = useCallback(() => {
    setText(generateLorem({ unit, count, startWithLorem }));
  }, [unit, count, startWithLorem]);

  useEffect(() => {
    generate();
  }, [generate]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <Segmented
          label="Unit"
          value={unit}
          options={UNITS}
          onChange={setUnit}
        />
        <ToolOptions className="gap-5">
          <label
            htmlFor="lorem-count"
            className="flex items-center gap-2.5 text-sm"
          >
            <span className="text-muted-foreground">How many</span>
            <Input
              id="lorem-count"
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(event) =>
                setCount(Number.parseInt(event.target.value, 10) || 1)
              }
              className="h-10 w-20 rounded-full bg-card px-4 text-center"
            />
          </label>
          <label
            htmlFor="lorem-opener"
            className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground"
          >
            <Checkbox
              id="lorem-opener"
              checked={startWithLorem}
              onCheckedChange={(checked) => setStartWithLorem(checked === true)}
            />
            Start with Lorem ipsum
          </label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={generate}
            className="sm:ml-auto"
          >
            <RefreshCw />
            Regenerate
          </Button>
        </ToolOptions>
      </div>
      <ToolField label="Placeholder text" action={<CopyButton value={text} />}>
        <ToolOutput value={text} className="h-96" />
      </ToolField>
    </div>
  );
}
