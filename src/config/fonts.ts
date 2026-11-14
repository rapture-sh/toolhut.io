import { DM_Mono, Plus_Jakarta_Sans } from "next/font/google";

/** Headings and body. Soft, humanist, tight at display sizes. */
export const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

/** Machine output only: counts, keyboard hints, tool input and output. */
export const fontMono = DM_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const fontVariables = `${fontSans.variable} ${fontMono.variable}`;
