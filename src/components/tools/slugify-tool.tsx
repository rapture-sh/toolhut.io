"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
  ToolOutput,
  ToolTextarea,
} from "~/components/tools/tool-io";
import { slugify } from "~/utils/slugify";

type Separator = "-" | "_";

const SEPARATORS = [
  { value: "-" as const, label: "Hyphen" },
  { value: "_" as const, label: "Underscore" },
];

export function SlugifyTool() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<Separator>("-");

  const slug = useMemo(() => slugify(input, { separator }), [input, separator]);

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="Separator"
          value={separator}
          options={SEPARATORS}
          onChange={setSeparator}
        />
      </ToolOptions>
      <ToolField label="Title">
        <ToolTextarea
          value={input}
          onChange={setInput}
          placeholder="Crème brûlée, and other things"
          className="h-32"
        />
      </ToolField>
      <ToolField label="Slug" action={<CopyButton value={slug} />}>
        <ToolOutput
          value={slug}
          placeholder="The slug appears here."
          className="h-32"
        />
      </ToolField>
    </div>
  );
}
