import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";
import { siteConfig } from "@/config/site";
import { PublicFooter, PublicHeader } from "./components/public-shell";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || "http://localhost:3000"),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#FAFAF9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><a className="skip-link" href="#main">Skip to content</a><PublicHeader />{children}<PublicFooter /></body>
    </html>
  );
}
