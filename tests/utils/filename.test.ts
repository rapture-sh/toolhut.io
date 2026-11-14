import { describe, expect, it } from "vitest";
import { downloadName, stripExtension } from "~/utils/filename";

describe("stripExtension", () => {
  it("should drop the extension and keep the rest of the name", () => {
    expect(stripExtension("holiday.photo.jpeg")).toBe("holiday.photo");
  });

  it("should leave a name that has no extension alone", () => {
    expect(stripExtension("README")).toBe("README");
  });

  it("should keep a dotfile intact rather than eating its name", () => {
    expect(stripExtension("archive.tar.gz")).toBe("archive.tar");
  });
});

describe("downloadName", () => {
  it("should swap the extension for what the file now is", () => {
    expect(downloadName("logo.svg", { extension: "png" })).toBe("logo.png");
  });

  it("should add the suffix between the name and the extension", () => {
    expect(
      downloadName("logo.png", { suffix: "512x512", extension: "png" }),
    ).toBe("logo-512x512.png");
  });

  it("should fall back to a usable name when there is nothing to work from", () => {
    expect(downloadName("   ", { extension: "txt" })).toBe("download.txt");
  });
});
