import { describe, expect, it } from "vitest";
import {
  NOT_STATED,
  parseUserAgent,
  summariseUserAgent,
  UserAgentError,
} from "~/utils/user-agent-parser";

const CHROME_ON_WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const SAFARI_ON_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1";

const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

function rowValue(rows: ReturnType<typeof parseUserAgent>, label: string) {
  return rows.find((row) => row.label === label)?.value;
}

describe("parseUserAgent", () => {
  it("reads Chrome on Windows", () => {
    const rows = parseUserAgent(CHROME_ON_WINDOWS);

    expect(rowValue(rows, "Browser")).toBe("Chrome");
    expect(rowValue(rows, "Browser version")).toBe("120.0.0.0");
    expect(rowValue(rows, "Engine")).toBe("Blink");
    expect(rowValue(rows, "Operating system")).toBe("Windows");
    expect(rowValue(rows, "System version")).toBe("10");
    expect(rowValue(rows, "Platform")).toBe("Desktop");
  });

  it("reads Safari on an iPhone, device and all", () => {
    const rows = parseUserAgent(SAFARI_ON_IPHONE);

    expect(rowValue(rows, "Browser")).toBe("Safari");
    expect(rowValue(rows, "Operating system")).toBe("iOS");
    expect(rowValue(rows, "Platform")).toBe("Mobile");
    expect(rowValue(rows, "Device")).toBe("Apple iPhone");
  });

  it("says what a bot string leaves out instead of leaving a blank", () => {
    const rows = parseUserAgent(GOOGLEBOT);

    expect(rowValue(rows, "Browser")).toBe("Googlebot");
    expect(rowValue(rows, "Engine")).toBe(NOT_STATED);
    expect(rowValue(rows, "Operating system")).toBe(NOT_STATED);
    expect(rowValue(rows, "Platform")).toBe("Bot");
  });

  it("keeps the same rows in the same order whatever the string", () => {
    const labels = (input: string) =>
      parseUserAgent(input).map((row) => row.label);

    expect(labels(GOOGLEBOT)).toEqual(labels(CHROME_ON_WINDOWS));
  });

  it("refuses an empty string", () => {
    expect(() => parseUserAgent("   ")).toThrow(UserAgentError);
  });

  it("reads a string with whitespace around it", () => {
    const rows = parseUserAgent(`  ${CHROME_ON_WINDOWS}  `);

    expect(rowValue(rows, "Browser")).toBe("Chrome");
  });
});

describe("summariseUserAgent", () => {
  it("writes one labelled line per row", () => {
    const summary = summariseUserAgent(parseUserAgent(CHROME_ON_WINDOWS));

    expect(summary.split("\n")).toHaveLength(7);
    expect(summary).toContain("Browser: Chrome");
  });

  it("is empty when there are no rows", () => {
    expect(summariseUserAgent([])).toBe("");
  });
});
