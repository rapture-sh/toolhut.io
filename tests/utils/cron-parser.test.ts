import { describe, expect, it } from "vitest";
import {
  CRON_FIELD_LABELS,
  CRON_PRESETS,
  CronParseError,
  cronFields,
  explainCron,
  nextRuns,
} from "~/utils/cron-parser";

const NOW = new Date("2024-01-02T00:07:00Z");

describe("explainCron", () => {
  it("should read a five field expression", () => {
    expect(explainCron("0 9 * * *")).toBe("At 09:00");
  });

  it("should read a step", () => {
    expect(explainCron("*/15 * * * *")).toBe("Every 15 minutes");
  });

  it("should read a named weekday", () => {
    expect(explainCron("0 9 * * MON")).toContain("Monday");
  });

  it("should ignore the whitespace around an expression", () => {
    expect(explainCron("  0 9 * * *  ")).toBe(explainCron("0 9 * * *"));
  });

  it("should ask for an expression when there is none", () => {
    expect(() => explainCron("   ")).toThrow(CronParseError);
  });

  it("should say how many fields are missing rather than guessing", () => {
    expect(() => explainCron("0 9")).toThrow(
      /five fields: minute, hour, day of month, month and day of week/,
    );
  });

  it("should refuse a field that cannot mean anything", () => {
    expect(() => explainCron("99 * * * *")).toThrow(CronParseError);
  });
});

describe("nextRuns", () => {
  it("should list the runs of a step from the moment it is given", () => {
    const runs = nextRuns("*/15 * * * *", {
      count: 3,
      now: NOW,
      timeZone: "UTC",
    });

    expect(runs.map((run) => run.toISOString())).toEqual([
      "2024-01-02T00:15:00.000Z",
      "2024-01-02T00:30:00.000Z",
      "2024-01-02T00:45:00.000Z",
    ]);
  });

  it("should follow a named weekday", () => {
    const [first] = nextRuns("0 9 * * MON", {
      count: 1,
      now: NOW,
      timeZone: "UTC",
    });

    expect(first?.toISOString()).toBe("2024-01-08T09:00:00.000Z");
  });

  it("should read the expression in the zone it was given", () => {
    const [first] = nextRuns("0 9 * * *", {
      count: 1,
      now: NOW,
      timeZone: "Europe/Berlin",
    });

    expect(first?.toISOString()).toBe("2024-01-02T08:00:00.000Z");
  });

  it("should return the runs in ascending order", () => {
    const runs = nextRuns("0 0 1 * *", { count: 5, now: NOW, timeZone: "UTC" });

    expect(runs).toHaveLength(5);
    for (let index = 1; index < runs.length; index += 1) {
      expect(runs[index]?.getTime()).toBeGreaterThan(
        Number(runs[index - 1]?.getTime()),
      );
    }
  });

  it("should ask for an expression when there is none", () => {
    expect(() => nextRuns("", { now: NOW })).toThrow(CronParseError);
  });

  it("should refuse an expression it cannot parse", () => {
    expect(() => nextRuns("nope nope nope nope nope", { now: NOW })).toThrow(
      CronParseError,
    );
  });
});

describe("cronFields", () => {
  it("should line a token up with every field", () => {
    expect(cronFields("*/15 0 1 2 MON")).toEqual([
      "*/15",
      "0",
      "1",
      "2",
      "MON",
    ]);
  });

  it("should leave the fields that are not written yet blank", () => {
    expect(cronFields("0 9")).toEqual(["0", "9", "", "", ""]);
  });

  it("should give a blank for every field of an empty expression", () => {
    expect(cronFields("")).toEqual(["", "", "", "", ""]);
    expect(cronFields("")).toHaveLength(CRON_FIELD_LABELS.length);
  });
});

describe("CRON_PRESETS", () => {
  it("should offer presets that every reader understands", () => {
    for (const preset of CRON_PRESETS) {
      expect(() => explainCron(preset.expression)).not.toThrow();
      expect(
        nextRuns(preset.expression, { count: 1, now: NOW, timeZone: "UTC" }),
      ).toHaveLength(1);
    }
  });
});
