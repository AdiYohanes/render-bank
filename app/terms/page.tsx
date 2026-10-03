import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms pending", robots: { index: false, follow: false } };

export default function Terms() {
  return <main id="main" className="content-wrap interim-page"><h1>Terms are not published yet.</h1><p>These are not terms of use. Prompt Pack purchases are unavailable while the site is being prepared.</p><Link href="/">Return Home</Link></main>;
}
