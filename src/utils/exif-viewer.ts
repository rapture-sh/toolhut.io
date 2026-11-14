import { downloadName } from "~/utils/filename";
import { extensionFor, type ImageFormat } from "~/utils/image-format";

/** Thrown when a coordinate is outside the range the earth has. */
export class MetadataError extends Error {
  constructor(message = "That is not a place on earth.") {
    super(message);
    this.name = "MetadataError";
  }
}

export interface MetadataRow {
  label: string;
  value: string;
}

export interface MetadataGroup {
  title: string;
  rows: MetadataRow[];
}

/**
 * The shape of the expanded output ExifReader returns, as loosely as this
 * module needs it. Every block is read defensively, because a photo can
 * carry anything.
 */
export interface MetadataTags {
  readonly file?: unknown;
  readonly exif?: unknown;
  readonly iptc?: unknown;
  readonly gps?: unknown;
  readonly png?: unknown;
  readonly pngFile?: unknown;
}

const LONGEST_VALUE = 200;

/** A tag holding raw bytes decodes to control characters, so it is not a value. */
function hasControlCharacter(text: string): boolean {
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;

    if (code < 32 || (code >= 127 && code <= 159)) {
      return true;
    }
  }

  return false;
}

function block(source: unknown): Record<string, unknown> | null {
  if (typeof source !== "object" || source === null || Array.isArray(source)) {
    return null;
  }

  return source as Record<string, unknown>;
}

function readable(raw: unknown): string | null {
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? String(raw) : null;
  }

  if (Array.isArray(raw)) {
    if (raw.length === 0 || raw.length > 8) {
      return null;
    }

    const parts = raw.map(readable);

    return parts.every((part) => part !== null) ? parts.join(", ") : null;
  }

  if (typeof raw !== "string") {
    return null;
  }

  const text = raw.replace(/\s+/g, " ").trim();

  if (
    text === "" ||
    text === "undefined" ||
    text.length > LONGEST_VALUE ||
    hasControlCharacter(text)
  ) {
    return null;
  }

  return text;
}

/** The description that was worked out for a tag, or its raw value. */
function tagText(source: unknown, name: string): string | null {
  const tag = block(source)?.[name];

  if (tag === undefined || tag === null) {
    return null;
  }

  const held = block(tag);

  if (!held) {
    return readable(tag);
  }

  return readable(held.description) ?? readable(held.value);
}

/** The raw value of a tag, for the places a description reads worse than it. */
function tagValue(source: unknown, name: string): string | null {
  const held = block(block(source)?.[name]);

  return held ? readable(held.value) : null;
}

function firstText(...values: (string | null)[]): string | null {
  return values.find((value) => value !== null) ?? null;
}

function numberAt(source: unknown, name: string): number | null {
  const held = block(source)?.[name];

  return typeof held === "number" && Number.isFinite(held) ? held : null;
}

function row(label: string, value: string | null): MetadataRow | null {
  return value === null ? null : { label, value };
}

export function formatCoordinate(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new MetadataError("That photo does not carry a readable position.");
  }

  if (Math.abs(latitude) > 90) {
    throw new MetadataError("A latitude has to be between -90 and 90.");
  }

  if (Math.abs(longitude) > 180) {
    throw new MetadataError("A longitude has to be between -180 and 180.");
  }

  const north = latitude >= 0 ? "N" : "S";
  const east = longitude >= 0 ? "E" : "W";

  return `${Math.abs(latitude).toFixed(4)}° ${north}, ${Math.abs(longitude).toFixed(4)}° ${east}`;
}

export function hasLocation(tags: MetadataTags): boolean {
  return (
    numberAt(tags.gps, "Latitude") !== null &&
    numberAt(tags.gps, "Longitude") !== null
  );
}

function locationRows(tags: MetadataTags): (MetadataRow | null)[] {
  const latitude = numberAt(tags.gps, "Latitude");
  const longitude = numberAt(tags.gps, "Longitude");
  const altitude = numberAt(tags.gps, "Altitude");

  return [
    row(
      "Coordinates",
      latitude !== null && longitude !== null
        ? formatCoordinate(latitude, longitude)
        : null,
    ),
    row("Altitude", altitude === null ? null : `${Math.round(altitude)} m`),
    row(
      "Position taken",
      firstText(
        tagText(tags.exif, "GPSDateStamp"),
        tagText(tags.exif, "GPSTimeStamp"),
      ),
    ),
  ];
}

function dimensions(tags: MetadataTags): string | null {
  const width = firstText(
    tagValue(tags.file, "Image Width"),
    tagValue(tags.pngFile, "Image Width"),
    tagValue(tags.exif, "PixelXDimension"),
    tagValue(tags.png, "Image Width"),
  );
  const height = firstText(
    tagValue(tags.file, "Image Height"),
    tagValue(tags.pngFile, "Image Height"),
    tagValue(tags.exif, "PixelYDimension"),
    tagValue(tags.png, "Image Height"),
  );

  return width !== null && height !== null ? `${width} x ${height}` : null;
}

/**
 * The metadata blocks, turned into the groups a reader wants in the order
 * they want them. Empty, binary and unreadable tags are left out, and a
 * group with nothing left in it is dropped.
 *
 * @throws MetadataError when a position is present but impossible.
 */
export function summariseTags(tags: MetadataTags): MetadataGroup[] {
  const candidates: { title: string; rows: (MetadataRow | null)[] }[] = [
    {
      title: "Camera",
      rows: [
        row("Make", tagText(tags.exif, "Make")),
        row("Model", tagText(tags.exif, "Model")),
        row("Software", tagText(tags.exif, "Software")),
      ],
    },
    {
      title: "Lens",
      rows: [
        row(
          "Lens",
          firstText(
            tagText(tags.exif, "LensModel"),
            tagText(tags.exif, "LensMake"),
          ),
        ),
        row("Focal length", tagText(tags.exif, "FocalLength")),
        row("35 mm equivalent", tagText(tags.exif, "FocalLengthIn35mmFilm")),
      ],
    },
    {
      title: "Exposure",
      rows: [
        row("Shutter", tagText(tags.exif, "ExposureTime")),
        row("Aperture", tagText(tags.exif, "FNumber")),
        row(
          "ISO",
          firstText(
            tagText(tags.exif, "ISOSpeedRatings"),
            tagText(tags.exif, "PhotographicSensitivity"),
          ),
        ),
        row("Program", tagText(tags.exif, "ExposureProgram")),
        row("Compensation", tagText(tags.exif, "ExposureBiasValue")),
        row("Metering", tagText(tags.exif, "MeteringMode")),
        row("Flash", tagText(tags.exif, "Flash")),
        row("White balance", tagText(tags.exif, "WhiteBalance")),
      ],
    },
    {
      title: "Date",
      rows: [
        row("Taken", tagText(tags.exif, "DateTimeOriginal")),
        row(
          "Digitised",
          firstText(
            tagText(tags.exif, "DateTimeDigitized"),
            tagText(tags.exif, "CreateDate"),
          ),
        ),
        row("Modified", tagText(tags.exif, "DateTime")),
        row(
          "Time zone",
          firstText(
            tagText(tags.exif, "OffsetTimeOriginal"),
            tagText(tags.exif, "OffsetTime"),
          ),
        ),
      ],
    },
    { title: "Location", rows: locationRows(tags) },
    {
      title: "Image",
      rows: [
        row("Dimensions", dimensions(tags)),
        row("Orientation", tagText(tags.exif, "Orientation")),
        row(
          "Colour space",
          firstText(
            tagText(tags.exif, "ColorSpace"),
            tagText(tags.pngFile, "Color Type"),
          ),
        ),
        row(
          "Bit depth",
          firstText(
            tagText(tags.file, "Bits Per Sample"),
            tagValue(tags.pngFile, "Bit Depth"),
          ),
        ),
        row("File type", tagText(tags.file, "FileType")),
        row(
          "Description",
          firstText(
            tagText(tags.exif, "ImageDescription"),
            tagText(tags.iptc, "Caption/Abstract"),
          ),
        ),
        row("Artist", tagText(tags.exif, "Artist")),
        row("Copyright", tagText(tags.exif, "Copyright")),
      ],
    },
  ];

  return candidates
    .map((candidate) => ({
      title: candidate.title,
      rows: candidate.rows.filter(
        (entry): entry is MetadataRow => entry !== null,
      ),
    }))
    .filter((group) => group.rows.length > 0);
}

export function cleanCopyName(original: string, format: ImageFormat): string {
  return downloadName(original, {
    suffix: "no-metadata",
    extension: extensionFor(format),
  });
}
