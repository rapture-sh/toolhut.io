import { mkdir } from "node:fs/promises";
import sharp from "sharp";

/**
 * Renders the app icons from the same mark the site draws, so the favicon can
 * never drift from `src/components/brand-mark.tsx`. Run with `pnpm icons`.
 */

const LAVENDER = "#b9c6f7";
const INK = "#14141a";

/** `inset` pulls the mark inside the safe zone a maskable icon needs. */
function markSvg(size, { rounded = true, inset = 0 } = {}) {
  const scale = (40 - inset * 2) / 40;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="${rounded ? 12 : 0}" fill="${LAVENDER}"/>
  <g transform="translate(${inset}, ${inset}) scale(${scale})" stroke="${INK}" stroke-width="3" stroke-linecap="round">
    <line x1="17.5" y1="11" x2="14.5" y2="29"/>
    <line x1="26" y1="11" x2="23" y2="29"/>
    <line x1="10.5" y1="17" x2="30" y2="17"/>
    <line x1="9.5" y1="23.5" x2="29" y2="23.5"/>
  </g>
</svg>`;
}

const targets = [
  { file: "public/icon-192.png", size: 192, options: {} },
  { file: "public/icon-512.png", size: 512, options: {} },
  {
    file: "public/icon-maskable-512.png",
    size: 512,
    options: { rounded: false, inset: 5 },
  },
  { file: "src/app/apple-icon.png", size: 180, options: {} },
];

await mkdir("public", { recursive: true });

for (const { file, size, options } of targets) {
  await sharp(Buffer.from(markSvg(size, options)))
    .resize(size, size)
    .png()
    .toFile(file);
  console.log(`wrote ${file} (${size}px)`);
}
