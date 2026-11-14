import type { ToolTag } from "~/lib/tools/types";

/**
 * A wash of the tag's own hue behind the hue itself. For chips and quiet state.
 * Written out in full because Tailwind only keeps class names it can find as
 * literal text.
 */
export const TAG_STYLES: Record<ToolTag, string> = {
  dev: "text-tag-dev bg-tag-dev/15",
  text: "text-tag-text bg-tag-text/15",
  image: "text-tag-image bg-tag-image/15",
  pdf: "text-tag-pdf bg-tag-pdf/15",
  data: "text-tag-data bg-tag-data/15",
  time: "text-tag-time bg-tag-time/15",
  crypto: "text-tag-crypto bg-tag-crypto/15",
  color: "text-tag-color bg-tag-color/15",
  web: "text-tag-web bg-tag-web/15",
};

/** The hue at full strength. For icon tiles and the selected filter. */
export const TAG_SOLID: Record<ToolTag, string> = {
  dev: "bg-tag-dev text-tag-on",
  text: "bg-tag-text text-tag-on",
  image: "bg-tag-image text-tag-on",
  pdf: "bg-tag-pdf text-tag-on",
  data: "bg-tag-data text-tag-on",
  time: "bg-tag-time text-tag-on",
  crypto: "bg-tag-crypto text-tag-on",
  color: "bg-tag-color text-tag-on",
  web: "bg-tag-web text-tag-on",
};

/** The hue on its own, for a hash that sits on the page rather than a chip. */
export const TAG_INK: Record<ToolTag, string> = {
  dev: "text-tag-dev",
  text: "text-tag-text",
  image: "text-tag-image",
  pdf: "text-tag-pdf",
  data: "text-tag-data",
  time: "text-tag-time",
  crypto: "text-tag-crypto",
  color: "text-tag-color",
  web: "text-tag-web",
};
