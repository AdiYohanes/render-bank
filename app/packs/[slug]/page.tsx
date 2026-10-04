import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { findPack } from "@/lib/discovery/public";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PackPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = await findPack(slug);
  if (!pack) notFound();
  return <main id="main" className="content-wrap interim-page"><p className="eyebrow">PROMPT PACK PREVIEW</p><h1>{pack.title}</h1><p>{pack.description}</p><p>This Prompt Pack is not yet available for purchase.</p><Link className="button-primary" href="/explore">Explore Prompts</Link></main>;
}
