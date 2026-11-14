import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { SiteSections } from "~/components/layout/site-sections";
import { ThemeProvider } from "~/components/theme-provider";
import { fontVariables } from "~/config/fonts";
import { siteConfig } from "~/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}, ${siteConfig.tagline.toLowerCase()}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "free online tools",
    "open source tools",
    "client side tools",
    "browser tools",
    "offline file converter",
    "convert files without uploading",
    "no upload pdf tools",
    "privacy friendly tools",
  ],
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name}, ${siteConfig.tagline.toLowerCase()}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${fontVariables} flex min-h-full flex-col font-sans`}>
        <ThemeProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteSections />
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
