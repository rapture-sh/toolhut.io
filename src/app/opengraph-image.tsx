import { ImageResponse } from "next/og";
import { siteConfig } from "~/config/site";

export const alt = `${siteConfig.name}, ${siteConfig.tagline.toLowerCase()}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LAVENDER = "#b9c6f7";
const INK = "#14141a";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: LAVENDER,
        color: INK,
        padding: 72,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg
          width="64"
          height="64"
          viewBox="0 0 40 40"
          fill="none"
          role="img"
          aria-label="toolhut"
        >
          <rect width="40" height="40" rx="12" fill={INK} />
          <g stroke={LAVENDER} strokeWidth="3" strokeLinecap="round">
            <line x1="17.5" y1="11" x2="14.5" y2="29" />
            <line x1="26" y1="11" x2="23" y2="29" />
            <line x1="10.5" y1="17" x2="30" y2="17" />
            <line x1="9.5" y1="23.5" x2="29" y2="23.5" />
          </g>
        </svg>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.6 }}>
          {siteConfig.name}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 86,
          fontWeight: 700,
          letterSpacing: -4,
          lineHeight: 1.05,
          maxWidth: 940,
        }}
      >
        Tools that never upload your files.
      </div>
      <div style={{ display: "flex", fontSize: 30, opacity: 0.7 }}>
        Free, open source, and running entirely in your browser.
      </div>
    </div>,
    size,
  );
}
