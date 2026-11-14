import { describe, expect, it } from "vitest";
import {
  describeInstant,
  fromUnix,
  relativePhrase,
  toUnix,
  UnixParseError,
} from "~/utils/timestamp-converter";

const SECONDS = { unit: "seconds" as const, timeZone: "UTC" };
const MILLISECONDS = { unit: "milliseconds" as const, timeZone: "UTC" };

describe("fromUnix", () => {
  it("should read a timestamp in seconds", () => {
    expect(fromUnix(1_700_000_000, SECONDS).toISOString()).toBe(
      "2023-11-14T22:13:20.000Z",
    );
  });

  it("should read a timestamp in milliseconds", () => {
    expect(fromUnix("1700000000123", MILLISECONDS).toISOString()).toBe(
      "2023-11-14T22:13:20.123Z",
    );
  });

  it("should read the epoch itself", () => {
    expect(fromUnix("0", SECONDS).toISOString()).toBe(
      "1970-01-01T00:00:00.000Z",
    );
  });

  it("should read a timestamp from before 1970", () => {
    expect(fromUnix("-86400", SECONDS).toISOString()).toBe(
      "1969-12-31T00:00:00.000Z",
    );
  });

  it("should refuse an empty field", () => {
    expect(() => fromUnix("  ", SECONDS)).toThrow(UnixParseError);
  });

  it("should refuse something that is not a number", () => {
    expect(() => fromUnix("yesterday", SECONDS)).toThrow(UnixParseError);
  });

  it("should refuse a timestamp past the end of time", () => {
    expect(() => fromUnix("99999999999999999", MILLISECONDS)).toThrow(
      UnixParseError,
    );
  });
});

describe("toUnix", () => {
  it("should read a date and a time as UTC", () => {
    expect(toUnix("2024-03-01 09:30", SECONDS)).toBe(
      Date.UTC(2024, 2, 1, 9, 30) / 1000,
    );
  });

  it("should read a bare date as midnight", () => {
    expect(toUnix("2024-03-01", SECONDS)).toBe(Date.UTC(2024, 2, 1) / 1000);
  });

  it("should read the wall clock in the zone it was given", () => {
    const winter = toUnix("2024-01-15 12:00", {
      unit: "seconds",
      timeZone: "Europe/Berlin",
    });
    const summer = toUnix("2024-07-15 12:00", {
      unit: "seconds",
      timeZone: "Europe/Berlin",
    });

    expect(winter).toBe(Date.UTC(2024, 0, 15, 11) / 1000);
    expect(summer).toBe(Date.UTC(2024, 6, 15, 10) / 1000);
  });

  it("should keep an offset that the text itself carries", () => {
    expect(toUnix("2024-03-01T09:30:00+02:00", SECONDS)).toBe(
      Date.UTC(2024, 2, 1, 7, 30) / 1000,
    );
  });

  it("should answer in milliseconds when asked", () => {
    expect(toUnix("2024-03-01T00:00:00.250Z", MILLISECONDS)).toBe(
      Date.UTC(2024, 2, 1) + 250,
    );
  });

  it("should refuse an empty field", () => {
    expect(() => toUnix("", SECONDS)).toThrow(UnixParseError);
  });

  it("should refuse a date it cannot read", () => {
    expect(() => toUnix("1st of March", SECONDS)).toThrow(UnixParseError);
  });

  it("should round-trip a timestamp through a date and back", () => {
    const seconds = 1_700_000_000;
    const date = fromUnix(seconds, SECONDS);

    expect(toUnix(date.toISOString(), SECONDS)).toBe(seconds);
  });
});

describe("relativePhrase", () => {
  const now = new Date("2024-03-01T12:00:00Z");

  it("should count hours back", () => {
    expect(relativePhrase(new Date("2024-03-01T09:00:00Z"), now)).toBe(
      "3 hours ago",
    );
  });

  it("should count minutes forward", () => {
    expect(relativePhrase(new Date("2024-03-01T12:05:00Z"), now)).toBe(
      "in 5 minutes",
    );
  });

  it("should say now for the same instant", () => {
    expect(relativePhrase(now, now)).toBe("now");
  });

  it("should count years for a long way back", () => {
    expect(relativePhrase(new Date("2021-03-01T12:00:00Z"), now)).toBe(
      "3 years ago",
    );
  });
});

describe("describeInstant", () => {
  it("should write the same zone label whatever the browser calls no offset", () => {
    const date = new Date("2024-03-01T09:30:00.000Z");

    expect(describeInstant(date, date, "UTC").local).toContain("(GMT)");
    expect(describeInstant(date, date, "UTC").local).not.toContain("GMT+");
  });

  const now = new Date("2024-03-01T12:00:00Z");
  const date = new Date("2024-03-01T09:30:00Z");

  it("should describe an instant in UTC", () => {
    const described = describeInstant(date, now, "UTC");

    expect(described.iso).toBe("2024-03-01T09:30:00.000Z");
    expect(described.utc).toBe("Fri, 01 Mar 2024 09:30:00 GMT");
    // Some browsers write GMT+0 for the same thing, which is tidied away.
    expect(described.local).toBe("2024-03-01 09:30:00 (GMT)");
    expect(described.relative).toBe("2 hours ago");
    expect(described.seconds).toBe(date.getTime() / 1000);
    expect(described.milliseconds).toBe(date.getTime());
  });

  it("should move the wall clock into the zone it was given", () => {
    expect(describeInstant(date, now, "Europe/Berlin").local).toBe(
      "2024-03-01 10:30:00 (GMT+1)",
    );
  });

  it("should refuse a date that is not one", () => {
    expect(() => describeInstant(new Date("nope"), now, "UTC")).toThrow(
      UnixParseError,
    );
  });
});
