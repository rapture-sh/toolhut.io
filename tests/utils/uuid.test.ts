import { describe, expect, it } from "vitest";
import { generateUuids, isUuid, uuidVersion } from "~/utils/uuid";

describe("generateUuids", () => {
  it("should return the requested number of values", () => {
    let n = 0;
    const source = () => `0000000${n++}-0000-4000-8000-000000000000`;

    expect(generateUuids(3, source)).toEqual([
      "00000000-0000-4000-8000-000000000000",
      "00000001-0000-4000-8000-000000000000",
      "00000002-0000-4000-8000-000000000000",
    ]);
  });

  it("should clamp the count, so a pasted number cannot hang the page", () => {
    const source = () => "00000000-0000-4000-8000-000000000000";

    expect(generateUuids(5000, source)).toHaveLength(500);
    expect(generateUuids(0, source)).toHaveLength(1);
  });

  it("should produce distinct values from the platform generator", () => {
    const produced = generateUuids(50);

    expect(new Set(produced).size).toBe(50);
    expect(produced.every(isUuid)).toBe(true);
  });
});

describe("isUuid", () => {
  it("should accept a v4 value whatever its case, and ignore padding", () => {
    expect(isUuid("9F8E7D6C-5B4A-4321-8765-0123456789AB")).toBe(true);
    expect(isUuid("  9f8e7d6c-5b4a-4321-8765-0123456789ab  ")).toBe(true);
  });

  it("should reject values that only look close", () => {
    expect(isUuid("9f8e7d6c5b4a432187650123456789ab")).toBe(false);
    expect(isUuid("9f8e7d6c-5b4a-4321-8765-0123456789a")).toBe(false);
    expect(isUuid("zzzzzzzz-5b4a-4321-8765-0123456789ab")).toBe(false);
  });

  it("should reject a variant digit outside the valid range", () => {
    expect(isUuid("9f8e7d6c-5b4a-4321-c765-0123456789ab")).toBe(false);
  });
});

describe("uuidVersion", () => {
  it("should read the version digit", () => {
    expect(uuidVersion("9f8e7d6c-5b4a-4321-8765-0123456789ab")).toBe(4);
    expect(uuidVersion("9f8e7d6c-5b4a-7321-8765-0123456789ab")).toBe(7);
  });

  it("should return null when the value is not a UUID", () => {
    expect(uuidVersion("nope")).toBeNull();
  });
});
