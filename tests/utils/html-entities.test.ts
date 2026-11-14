import { describe, expect, it } from "vitest";
import { decodeEntities, encodeEntities } from "~/utils/html-entities";

describe("encodeEntities", () => {
  it("should escape the five characters that break markup", () => {
    expect(encodeEntities(`<a href="x">it's &</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;it&#39;s &amp;&lt;/a&gt;",
    );
  });

  it("should leave text outside ASCII alone by default", () => {
    expect(encodeEntities("café")).toBe("café");
  });

  it("should escape text outside ASCII when asked", () => {
    expect(encodeEntities("café", { nonAscii: true })).toBe("caf&#233;");
  });

  it("should escape the ampersand first, so entities are not double built", () => {
    expect(encodeEntities("&amp;")).toBe("&amp;amp;");
  });
});

describe("decodeEntities", () => {
  it("should round-trip what encode produced", () => {
    const original = `<p class="x">it's & more</p>`;

    expect(decodeEntities(encodeEntities(original))).toBe(original);
  });

  it("should read named, decimal and hex entities", () => {
    expect(decodeEntities("&copy; &#169; &#xa9;")).toBe("© © ©");
  });

  it("should leave an unknown entity exactly as it found it", () => {
    expect(decodeEntities("&notareal; thing")).toBe("&notareal; thing");
  });

  it("should handle a code point outside the basic plane", () => {
    expect(decodeEntities("&#128075;")).toBe("👋");
  });
});
