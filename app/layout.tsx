import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";
import { PublicFooter, PublicHeader } from "./components/public-shell";

import { siteConfig, siteUrl } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
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
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <PublicHeader />
        {children}
        <PublicFooter />
      </body>
    </html>
  );
}
