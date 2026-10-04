import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { findPrompt } from "@/lib/discovery/public";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PromptPreview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prompt = await findPrompt(slug);

  if (!prompt) notFound();

  return (
    <main className="content-wrap interim-page" id="main">
      <p className="eyebrow">
        {prompt.access_type === "FREE" ? "FREE" : "PREMIUM"} · PUBLIC PREVIEW
      </p>
      <h1>{prompt.title}</h1>
      <p>{prompt.short_description}</p>
      <p>
        The full Prompt detail and copy experience is coming soon. No account is
        needed to explore the library.
      </p>
      <Link className="button-primary" href="/explore">
        Explore Prompts
      </Link>
    </main>
  );
}
