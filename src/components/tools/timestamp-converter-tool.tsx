"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  CopyButton,
  Segmented,
  ToolField,
  ToolOptions,
  ToolPanes,
} from "~/components/tools/tool-io";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  describeInstant,
  fromUnix,
  localTimeZone,
  parseDate,
  type TimeUnit,
  UnixParseError,
} from "~/utils/timestamp-converter";

type Direction = "to-date" | "to-unix";

type ZoneChoice = "local" | "utc";

const DIRECTIONS = [
  { value: "to-date" as const, label: "Timestamp to date" },
  { value: "to-unix" as const, label: "Date to timestamp" },
];

const UNITS = [
  { value: "seconds" as const, label: "Seconds" },
  { value: "milliseconds" as const, label: "Milliseconds" },
];

const ZONES = [
  { value: "local" as const, label: "Local" },
  { value: "utc" as const, label: "UTC" },
];

interface Row {
  label: string;
  value: string;
}

interface Result {
  rows: Row[];
  error: string | null;
}

function convert(
  direction: Direction,
  input: string,
  unit: TimeUnit,
  timeZone: string,
  now: Date,
): Result {
  if (input.trim() === "") {
    return { rows: [], error: null };
  }

  try {
    const date =
      direction === "to-date"
        ? fromUnix(input, { unit, timeZone })
        : parseDate(input, timeZone);
    const described = describeInstant(date, now, timeZone);

    if (direction === "to-date") {
      return {
        rows: [
          { label: "ISO 8601", value: described.iso },
          { label: "UTC", value: described.utc },
          { label: `Wall clock (${timeZone})`, value: described.local },
          { label: "Relative", value: described.relative },
        ],
        error: null,
      };
    }

    return {
      rows: [
        { label: "Seconds", value: String(described.seconds) },
        { label: "Milliseconds", value: String(described.milliseconds) },
        { label: "ISO 8601", value: described.iso },
        { label: "Relative", value: described.relative },
      ],
      error: null,
    };
  } catch (error) {
    if (error instanceof UnixParseError) {
      return { rows: [], error: error.message };
    }
    throw error;
  }
}

/** Until the clock is read on the client there is nothing to show. */
const EMPTY = { rows: [], error: null } as const;

export function TimestampConverterTool() {
  const [direction, setDirection] = useState<Direction>("to-date");
  const [unit, setUnit] = useState<TimeUnit>("seconds");
  const [zone, setZone] = useState<ZoneChoice>("local");
  const [input, setInput] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  const inputId = useId();

  useEffect(() => {
    setNow(new Date());
  }, []);

  const timeZone = useMemo(
    () => (zone === "utc" ? "UTC" : localTimeZone()),
    [zone],
  );

  const { rows, error } = useMemo(
    () => (now ? convert(direction, input, unit, timeZone, now) : EMPTY),
    [direction, input, unit, timeZone, now],
  );

  const fillWithNow = () => {
    const current = new Date();
    setNow(current);

    if (direction === "to-date") {
      const described = describeInstant(current, current, timeZone);
      setInput(
        String(unit === "seconds" ? described.seconds : described.milliseconds),
      );
      return;
    }

    setInput(describeInstant(current, current, timeZone).local.slice(0, 19));
  };

  return (
    <div className="flex flex-col gap-5">
      <ToolOptions>
        <Segmented
          label="Direction"
          value={direction}
          options={DIRECTIONS}
          onChange={setDirection}
        />
        <Segmented
          label="Unit"
          value={unit}
          options={UNITS}
          onChange={setUnit}
        />
        <Segmented
          label="Time zone"
          value={zone}
          options={ZONES}
          onChange={setZone}
        />
      </ToolOptions>
      <ToolPanes>
        <div className="flex flex-col gap-2">
          <div className="flex min-h-9 items-center justify-between gap-2">
            <label htmlFor={inputId} className="text-sm font-medium">
              {direction === "to-date" ? "Unix timestamp" : "Date and time"}
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={fillWithNow}
            >
              Now
            </Button>
          </div>
          <Input
            id={inputId}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              direction === "to-date" ? "1700000000" : "2024-03-01 09:30"
            }
            className="font-mono"
          />
          <p className="text-sm text-muted-foreground">
            {direction === "to-date"
              ? "A number of seconds or milliseconds since 1 January 1970."
              : "A date, or a date and a time, read in the zone chosen above."}
          </p>
        </div>
        <ToolField label="Result">
          <div
            aria-live="polite"
            className="scroll-slim w-full overflow-auto rounded-2xl bg-card p-2"
          >
            {error && <p className="p-2 text-sm text-destructive">{error}</p>}
            {!error && rows.length === 0 && (
              <p className="p-2 text-sm text-muted-foreground">
                The result appears here.
              </p>
            )}
            {rows.length > 0 && (
              <dl className="flex flex-col">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-2 py-1"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="flex min-w-0 items-center gap-1">
                      <span className="min-w-0 break-all font-mono text-sm">
                        {row.value}
                      </span>
                      <CopyButton value={row.value} className="shrink-0" />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </ToolField>
      </ToolPanes>
    </div>
  );
}
