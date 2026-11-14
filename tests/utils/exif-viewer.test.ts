import { describe, expect, it } from "vitest";
import {
  cleanCopyName,
  formatCoordinate,
  hasLocation,
  MetadataError,
  type MetadataGroup,
  summariseTags,
} from "~/utils/exif-viewer";

const photoWithGps = {
  file: {
    FileType: { value: "jpeg", description: "JPEG" },
    "Image Width": { value: 4032, description: "4032px" },
    "Image Height": { value: 3024, description: "3024px" },
    "Bits Per Sample": { value: 8, description: 8 },
  },
  exif: {
    Make: { id: 271, value: ["FUJIFILM"], description: "FUJIFILM" },
    Model: { id: 272, value: ["X-T30"], description: "X-T30" },
    Software: { id: 305, value: [""], description: "" },
    LensModel: { id: 42036, value: ["XF35mmF2"], description: "XF35mmF2" },
    FocalLength: { id: 37386, value: [35, 1], description: "35 mm" },
    ExposureTime: { id: 33434, value: [1, 250], description: "1/250" },
    FNumber: { id: 33437, value: [2, 1], description: "f/2" },
    ISOSpeedRatings: { id: 34855, value: 400, description: 400 },
    Flash: { id: 37385, value: new Uint8Array([0]), description: "" },
    DateTimeOriginal: {
      id: 36867,
      value: ["2024:08:11 18:42:07"],
      description: "2024:08:11 18:42:07",
    },
    Orientation: { id: 274, value: 1, description: "top-left" },
    ImageDescription: {
      id: 270,
      value: ["y".repeat(300)],
      description: "y".repeat(300),
    },
    Artist: { id: 315, value: new ArrayBuffer(8), description: "" },
    MakerNote: { id: 37500, value: new ArrayBuffer(512), description: "" },
  },
  gps: { Latitude: 47.3769, Longitude: 8.5417, Altitude: 412.6 },
};

const screenshotWithoutExif = {
  pngFile: {
    "Image Width": { value: 1280, description: "1280px" },
    "Image Height": { value: 800, description: "800px" },
    "Bit Depth": { value: 8, description: 8 },
    "Color Type": { value: 6, description: "RGB with Alpha" },
  },
};

function rowValue(
  groups: MetadataGroup[],
  title: string,
  label: string,
): string | undefined {
  return groups
    .find((group) => group.title === title)
    ?.rows.find((row) => row.label === label)?.value;
}

describe("summariseTags", () => {
  it("groups a photo in a fixed order", () => {
    expect(summariseTags(photoWithGps).map((group) => group.title)).toEqual([
      "Camera",
      "Lens",
      "Exposure",
      "Date",
      "Location",
      "Image",
    ]);
  });

  it("reads the camera, the exposure and the date a photo carries", () => {
    const groups = summariseTags(photoWithGps);

    expect(rowValue(groups, "Camera", "Model")).toBe("X-T30");
    expect(rowValue(groups, "Lens", "Focal length")).toBe("35 mm");
    expect(rowValue(groups, "Exposure", "Shutter")).toBe("1/250");
    expect(rowValue(groups, "Exposure", "ISO")).toBe("400");
    expect(rowValue(groups, "Date", "Taken")).toBe("2024:08:11 18:42:07");
    expect(rowValue(groups, "Image", "Dimensions")).toBe("4032 x 3024");
    expect(rowValue(groups, "Image", "Bit depth")).toBe("8");
  });

  it("puts the position and the altitude in the location group", () => {
    const groups = summariseTags(photoWithGps);

    expect(rowValue(groups, "Location", "Coordinates")).toBe(
      "47.3769° N, 8.5417° E",
    );
    expect(rowValue(groups, "Location", "Altitude")).toBe("413 m");
  });

  it("drops a tag with an empty, binary or runaway value", () => {
    const groups = summariseTags(photoWithGps);

    expect(rowValue(groups, "Camera", "Software")).toBeUndefined();
    expect(rowValue(groups, "Exposure", "Flash")).toBeUndefined();
    expect(rowValue(groups, "Image", "Artist")).toBeUndefined();
    expect(rowValue(groups, "Image", "Description")).toBeUndefined();
  });

  it("describes a PNG that carries nothing but its own header", () => {
    const groups = summariseTags(screenshotWithoutExif);

    expect(groups.map((group) => group.title)).toEqual(["Image"]);
    expect(rowValue(groups, "Image", "Dimensions")).toBe("1280 x 800");
    expect(rowValue(groups, "Image", "Colour space")).toBe("RGB with Alpha");
    expect(rowValue(groups, "Image", "Bit depth")).toBe("8");
  });

  it("returns nothing at all for a file with no metadata", () => {
    expect(summariseTags({})).toEqual([]);
  });

  it("refuses a position that is not on earth", () => {
    expect(() =>
      summariseTags({ gps: { Latitude: 120, Longitude: 8 } }),
    ).toThrow(MetadataError);
  });
});

describe("formatCoordinate", () => {
  it("reads north and east as positive", () => {
    expect(formatCoordinate(47.3769, 8.5417)).toBe("47.3769° N, 8.5417° E");
  });

  it("reads south and west as negative", () => {
    expect(formatCoordinate(-33.8688, -151.2093)).toBe(
      "33.8688° S, 151.2093° W",
    );
  });

  it("rejects a coordinate outside the range the earth has", () => {
    expect(() => formatCoordinate(91, 0)).toThrow(MetadataError);
    expect(() => formatCoordinate(0, 181)).toThrow(MetadataError);
  });

  it("rejects a coordinate that is not a number", () => {
    expect(() => formatCoordinate(Number.NaN, 0)).toThrow(MetadataError);
  });
});

describe("hasLocation", () => {
  it("is true only when both halves of a position are there", () => {
    expect(hasLocation(photoWithGps)).toBe(true);
    expect(hasLocation(screenshotWithoutExif)).toBe(false);
    expect(hasLocation({ gps: { Latitude: 47.3769 } })).toBe(false);
  });
});

describe("cleanCopyName", () => {
  it("names the stripped copy after the original", () => {
    expect(cleanCopyName("DSCF1234.jpg", "jpeg")).toBe(
      "DSCF1234-no-metadata.jpg",
    );
  });
});
