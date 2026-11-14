import type { PdfMetadata } from "~/lib/pdf/build";
import { downloadName } from "~/utils/filename";

export interface MetadataRow {
  label: string;
  value: string;
}

/** What an empty field reads as, so a reader sees the field either way. */
const NOT_SET = "not set";

/**
 * A date in a PDF is written `D:20240811184207+02'00'`, where the offset says
 * how far the clock that wrote it sat from UT.
 */
const PDF_DATE =
  /^(?:D:)?(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?(?:(Z|\+|-)(\d{2})?'?(\d{2})?'?)?$/;

function text(raw: unknown): string {
  return typeof raw === "string" ? raw.replace(/\s+/g, " ").trim() : "";
}

function pdfDate(raw: unknown): Date | undefined {
  if (typeof raw !== "string") {
    return undefined;
  }

  const found = PDF_DATE.exec(raw.trim());

  if (!found) {
    return undefined;
  }

  const [
    ,
    year = "",
    month = "01",
    day = "01",
    hour = "00",
    minute = "00",
    second = "00",
    sign,
    offsetHour = "00",
    offsetMinute = "00",
  ] = found;

  if (
    Number(month) < 1 ||
    Number(month) > 12 ||
    Number(day) < 1 ||
    Number(day) > 31 ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59
  ) {
    return undefined;
  }

  const local = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  const offset =
    sign === undefined || sign === "Z"
      ? 0
      : (Number(offsetHour) * 60 + Number(offsetMinute)) *
        (sign === "-" ? -1 : 1);

  return new Date(local - offset * 60_000);
}

/**
 * The information dictionary a PDF carries, as the fields this tool shows.
 * Everything is read defensively, because a document can hold anything under
 * these keys.
 */
export function metadataFromInfo(info: unknown): PdfMetadata {
  const held: Record<string, unknown> =
    typeof info === "object" && info !== null && !Array.isArray(info)
      ? (info as Record<string, unknown>)
      : {};

  return {
    title: text(held.Title),
    author: text(held.Author),
    subject: text(held.Subject),
    keywords: text(held.Keywords),
    creator: text(held.Creator),
    producer: text(held.Producer),
    created: pdfDate(held.CreationDate),
    modified: pdfDate(held.ModDate),
  };
}

/** UTC, so a document reads the same wherever it is opened. */
function readableDate(date: Date | undefined): string {
  if (!date || Number.isNaN(date.getTime())) {
    return NOT_SET;
  }

  return `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

function field(value: string): string {
  const trimmed = value.trim();

  return trimmed === "" ? NOT_SET : trimmed;
}

/** Every field a PDF can carry about itself, in the order a reader wants. */
export function metadataRows(metadata: PdfMetadata): MetadataRow[] {
  return [
    { label: "Title", value: field(metadata.title) },
    { label: "Author", value: field(metadata.author) },
    { label: "Subject", value: field(metadata.subject) },
    { label: "Keywords", value: field(metadata.keywords) },
    { label: "Creator", value: field(metadata.creator) },
    { label: "Producer", value: field(metadata.producer) },
    { label: "Created", value: readableDate(metadata.created) },
    { label: "Modified", value: readableDate(metadata.modified) },
  ];
}

/** Whether the document says anything about itself worth taking out. */
export function hasMetadata(metadata: PdfMetadata): boolean {
  return metadataRows(metadata).some((row) => row.value !== NOT_SET);
}

/** `report.pdf` becomes `report-clean.pdf`. */
export function cleanName(original: string): string {
  return downloadName(original, { suffix: "clean", extension: "pdf" });
}
