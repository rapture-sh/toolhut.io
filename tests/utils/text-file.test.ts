import { describe, expect, it } from "vitest";
import { isTextFileName, isTextFileType } from "~/utils/text-file";

describe("isTextFileName", () => {
  it("accepts the extensions people drop on a text field", () => {
    expect(isTextFileName("notes.md")).toBe(true);
    expect(isTextFileName("data.JSON")).toBe(true);
    expect(isTextFileName("query.sql")).toBe(true);
  });

  it("rejects a binary that would come out as nonsense", () => {
    expect(isTextFileName("holiday.jpg")).toBe(false);
    expect(isTextFileName("report.pdf")).toBe(false);
  });

  it("rejects a name with no extension at all", () => {
    expect(isTextFileName("Makefile")).toBe(false);
  });
});

describe("isTextFileType", () => {
  it("accepts anything the browser calls text", () => {
    expect(isTextFileType("text/plain")).toBe(true);
    expect(isTextFileType("text/csv; charset=utf-8")).toBe(true);
  });

  it("accepts the structured formats that are text underneath", () => {
    expect(isTextFileType("application/json")).toBe(true);
    expect(isTextFileType("image/svg+xml")).toBe(true);
  });

  it("rejects a raster image", () => {
    expect(isTextFileType("image/png")).toBe(false);
  });

  it("rejects the empty type a browser gives an unknown file", () => {
    expect(isTextFileType("")).toBe(false);
  });
});
