import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

export default function About() {
  return <main id="main" className="content-wrap interim-page"><p className="eyebrow">ABOUT RENDERBANK</p><h1>Better starting points for visual ideas.</h1><p>RenderBank is a visual-first library of curated AI Prompts for creators, marketers and teams. We aim to pair each usable recipe with its visual outcome, practical settings and a clear path to try it.</p><p>Our library is still being prepared. Items marked Demo Content are examples for development, not tested or approved launch inventory.</p><Link className="button-primary" href="/explore">Explore Prompts</Link></main>;
}
