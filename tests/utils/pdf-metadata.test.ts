import { describe, expect, it } from "vitest";
import type { PdfMetadata } from "~/lib/pdf/build";
import {
  cleanName,
  hasMetadata,
  metadataFromInfo,
  metadataRows,
} from "~/utils/pdf-metadata";

const full: PdfMetadata = {
  title: "Quarterly report",
  author: "Dana Hale",
  subject: "Numbers for the board",
  keywords: "quarter, revenue",
  creator: "Acme Writer",
  producer: "Acme Writer 3",
  created: new Date("2023-05-02T09:30:00Z"),
  modified: new Date("2023-05-03T10:00:00Z"),
};

const empty: PdfMetadata = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
  producer: "",
  created: undefined,
  modified: undefined,
};

const producerOnly: PdfMetadata = { ...empty, producer: "Acme Writer 3" };

function rowValue(metadata: PdfMetadata, label: string): string | undefined {
  return metadataRows(metadata).find((row) => row.label === label)?.value;
}

describe("metadataRows", () => {
  it("should read every field a document carries", () => {
    expect(metadataRows(full)).toEqual([
      { label: "Title", value: "Quarterly report" },
      { label: "Author", value: "Dana Hale" },
      { label: "Subject", value: "Numbers for the board" },
      { label: "Keywords", value: "quarter, revenue" },
      { label: "Creator", value: "Acme Writer" },
      { label: "Producer", value: "Acme Writer 3" },
      { label: "Created", value: "2023-05-02 09:30:00 UTC" },
      { label: "Modified", value: "2023-05-03 10:00:00 UTC" },
    ]);
  });

  it("should write an empty field as not set rather than drop it", () => {
    const rows = metadataRows(empty);

    expect(rows).toHaveLength(8);
    expect(rows.every((row) => row.value === "not set")).toBe(true);
  });

  it("should keep the one field a document does carry", () => {
    expect(rowValue(producerOnly, "Producer")).toBe("Acme Writer 3");
    expect(rowValue(producerOnly, "Title")).toBe("not set");
  });

  it("should write a date that is not a date as not set", () => {
    expect(
      rowValue({ ...empty, created: new Date(Number.NaN) }, "Created"),
    ).toBe("not set");
  });

  it("should write a field of only whitespace as not set", () => {
    expect(rowValue({ ...empty, author: "   " }, "Author")).toBe("not set");
  });
});

describe("hasMetadata", () => {
  it("should see what a full document carries", () => {
    expect(hasMetadata(full)).toBe(true);
  });

  it("should see nothing in a document that carries nothing", () => {
    expect(hasMetadata(empty)).toBe(false);
  });

  it("should see a single field on its own", () => {
    expect(hasMetadata(producerOnly)).toBe(true);
  });

  it("should count a date as something worth stripping", () => {
    expect(
      hasMetadata({ ...empty, created: new Date("2023-05-02T09:30:00Z") }),
    ).toBe(true);
  });
});

describe("metadataFromInfo", () => {
  it("should read the fields an information dictionary holds", () => {
    const metadata = metadataFromInfo({
      Title: "Quarterly report",
      Author: "Dana Hale",
      Producer: "Acme Writer 3",
      CreationDate: "D:20240811184207Z",
    });

    expect(metadata.title).toBe("Quarterly report");
    expect(metadata.author).toBe("Dana Hale");
    expect(metadata.producer).toBe("Acme Writer 3");
    expect(metadata.created?.toISOString()).toBe("2024-08-11T18:42:07.000Z");
  });

  it("should take a date back to UTC through its offset", () => {
    const metadata = metadataFromInfo({
      CreationDate: "D:20240811184207+02'00'",
      ModDate: "D:20240811184207-05'30'",
    });

    expect(metadata.created?.toISOString()).toBe("2024-08-11T16:42:07.000Z");
    expect(metadata.modified?.toISOString()).toBe("2024-08-12T00:12:07.000Z");
  });

  it("should read a date that stops at the day", () => {
    expect(metadataFromInfo({ ModDate: "D:20240811" })?.modified).toEqual(
      new Date("2024-08-11T00:00:00Z"),
    );
  });

  it("should leave out a date it cannot make sense of", () => {
    expect(
      metadataFromInfo({ CreationDate: "yesterday" }).created,
    ).toBeUndefined();
    expect(
      metadataFromInfo({ CreationDate: "D:20249911" }).created,
    ).toBeUndefined();
    expect(
      metadataFromInfo({ CreationDate: 1723401727 }).created,
    ).toBeUndefined();
  });

  it("should read a document with an empty dictionary as carrying nothing", () => {
    expect(hasMetadata(metadataFromInfo({}))).toBe(false);
  });

  it("should survive anything that is not a dictionary", () => {
    expect(hasMetadata(metadataFromInfo(undefined))).toBe(false);
    expect(hasMetadata(metadataFromInfo("Title"))).toBe(false);
  });
});

describe("cleanName", () => {
  it("should mark the copy without losing the original name", () => {
    expect(cleanName("quarterly report.pdf")).toBe(
      "quarterly report-clean.pdf",
    );
  });

  it("should fall back to a usable name", () => {
    expect(cleanName("  ")).toBe("download-clean.pdf");
  });
});
