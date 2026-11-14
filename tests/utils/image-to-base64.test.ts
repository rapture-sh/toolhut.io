import { describe, expect, it } from "vitest";
import { toBase64 } from "~/utils/bytes";
import {
  cssBackgroundRule,
  DataUriError,
  dataUri,
  encodedFileName,
  encodedSize,
  imgTag,
  renderBase64,
} from "~/utils/image-to-base64";

const PIXEL = "iVBORw0KGgo=";
const PIXEL_URI = `data:image/png;base64,${PIXEL}`;

describe("dataUri", () => {
  it("builds a data URI from a media type and base64", () => {
    expect(dataUri("image/png", PIXEL)).toBe(PIXEL_URI);
  });

  it("normalises the media type and drops line breaks in the payload", () => {
    expect(dataUri(" IMAGE/SVG+XML ", "iVBO\nRw0=")).toBe(
      "data:image/svg+xml;base64,iVBORw0=",
    );
  });

  it("rejects a type that is not an image", () => {
    expect(() => dataUri("text/plain", PIXEL)).toThrow(DataUriError);
  });

  it("rejects an empty payload", () => {
    expect(() => dataUri("image/png", "   ")).toThrow(DataUriError);
  });

  it("rejects a payload that is not base64", () => {
    expect(() => dataUri("image/png", "not base64!")).toThrow(DataUriError);
  });
});

describe("cssBackgroundRule", () => {
  it("quotes the URI inside a background-image rule", () => {
    expect(cssBackgroundRule(PIXEL_URI)).toBe(
      [
        ".image {",
        `  background-image: url("${PIXEL_URI}");`,
        "  background-repeat: no-repeat;",
        "  background-size: contain;",
        "}",
      ].join("\n"),
    );
  });

  it("rejects anything that is not a data URI", () => {
    expect(() => cssBackgroundRule("")).toThrow(DataUriError);
    expect(() => cssBackgroundRule("/images/logo.png")).toThrow(DataUriError);
  });
});

describe("imgTag", () => {
  it("writes an img element with the URI as its source", () => {
    expect(imgTag(PIXEL_URI, "A red dot")).toBe(
      `<img src="${PIXEL_URI}" alt="A red dot" />`,
    );
  });

  it("escapes a filename that would break out of the attribute", () => {
    expect(imgTag(PIXEL_URI, 'a "<b>" & c')).toBe(
      `<img src="${PIXEL_URI}" alt="a &quot;&lt;b&gt;&quot; &amp; c" />`,
    );
  });

  it("rejects anything that is not a data URI", () => {
    expect(() => imgTag("", "dot")).toThrow(DataUriError);
  });
});

describe("encodedSize", () => {
  it("matches the length base64 actually produces", () => {
    for (const length of [1, 2, 3, 4, 5, 17, 64]) {
      const bytes = Uint8Array.from({ length }, (_, index) => index);

      expect(encodedSize(length)).toBe(toBase64(bytes).length);
    }
  });

  it("encodes nothing as nothing", () => {
    expect(encodedSize(0)).toBe(0);
  });

  it("grows a file by about a third", () => {
    expect(encodedSize(3_000_000)).toBe(4_000_000);
  });

  it("rejects a size that is not a size", () => {
    expect(() => encodedSize(-1)).toThrow(DataUriError);
    expect(() => encodedSize(Number.NaN)).toThrow(DataUriError);
  });
});

describe("renderBase64", () => {
  it("returns the plain URI, the CSS rule or the HTML tag", () => {
    expect(renderBase64("uri", PIXEL_URI, "dot")).toBe(PIXEL_URI);
    expect(renderBase64("css", PIXEL_URI, "dot")).toContain("background-image");
    expect(renderBase64("html", PIXEL_URI, "dot")).toContain("<img");
  });

  it("rejects a missing URI in every view", () => {
    expect(() => renderBase64("uri", "", "dot")).toThrow(DataUriError);
    expect(() => renderBase64("css", "", "dot")).toThrow(DataUriError);
    expect(() => renderBase64("html", "", "dot")).toThrow(DataUriError);
  });
});

describe("encodedFileName", () => {
  it("names the text file after the image", () => {
    expect(encodedFileName("logo.svg")).toBe("logo-base64.txt");
    expect(encodedFileName("")).toBe("download-base64.txt");
  });
});
