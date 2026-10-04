import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { siteUrl } from "@/config/site";
import { ArtworkFrame } from "@/app/components/artwork";
import { artworkUrl } from "@/lib/discovery/public";
import { findPromptDetail } from "@/lib/prompts/public";

import { LockedLinkAction, PromptActions } from "./prompt-actions";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await findPromptDetail(slug);
  if (!prompt) return { robots: { index: false } };
  const path = `/prompts/${prompt.slug}`;
  const image = prompt.images.find(({ is_primary }) => is_primary) ?? prompt.images[0];
  const source = image?.media_assets && artworkUrl(image.media_assets);
  return {
    title: prompt.title,
    description: prompt.short_description,
    alternates: { canonical: path },
    openGraph: { title: prompt.title, description: prompt.short_description, url: path,
      images: source ? [{ url: source, alt: image?.alt_text || prompt.title }] : undefined },
  };
}

export default async function PromptDetail({ params }: Props) {
  const { slug } = await params;
  const prompt = await findPromptDetail(slug);
  if (!prompt) notFound();
  const image = prompt.images.find(({ is_primary }) => is_primary) ?? prompt.images[0];
  const modelNames = prompt.models.map(({ models }) => models?.name).filter(Boolean).join(", ");
  const url = `${siteUrl().replace(/\/$/, "")}/prompts/${prompt.slug}`;

  return <main className="content-wrap prompt-detail" id="main">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org", "@type": "CreativeWork", name: prompt.title,
      description: prompt.short_description, url,
    }).replace(/</g, "\\u003c") }} />
    <div className="prompt-detail-hero">
      <div className="prompt-detail-artwork" style={{ aspectRatio: image?.media_assets ? `${image.media_assets.width} / ${image.media_assets.height}` : "4 / 5" }}>
        <ArtworkFrame asset={image?.media_assets} alt={image?.alt_text || prompt.title} priority />
      </div>
      <div className="prompt-detail-intro">
        <p className="eyebrow">{prompt.state === "free" ? "FREE PROMPT" : "PREMIUM PROMPT"}</p>
        <h1>{prompt.title}</h1>
        <p>{prompt.short_description}</p>
        {prompt.description && <p>{prompt.description}</p>}
        <dl className="prompt-detail-meta">
          {prompt.category && <div><dt>Category</dt><dd><Link href={`/category/${prompt.category.slug}`}>{prompt.category.name}</Link></dd></div>}
          {modelNames && <div><dt>Recommended model</dt><dd>{modelNames}</dd></div>}
          {prompt.aspect_ratio && <div><dt>Aspect ratio</dt><dd>{prompt.aspect_ratio}</dd></div>}
          {prompt.orientation && <div><dt>Orientation</dt><dd>{prompt.orientation.toLowerCase()}</dd></div>}
        </dl>
        {prompt.state === "locked" && <div className="prompt-lock"><h2>Premium Prompt</h2>
          <p>{prompt.pack ? `Included in ${prompt.pack.title}` : "This prompt is available in a curated pack."}</p>
          {prompt.pack && <Link className="button-primary" href={`/packs/${prompt.pack.slug}`}>View Pack</Link>}
          <LockedLinkAction url={url} />
        </div>}
      </div>
    </div>
    {prompt.state === "free" && <>
      <PromptActions template={prompt.content.prompt_template} variables={prompt.variables} url={url} />
      <section className="prompt-settings"><h2>Recommended settings</h2><ul>
        {modelNames && <li>Model: {modelNames}</li>}
        {prompt.aspect_ratio && <li>Aspect ratio: {prompt.aspect_ratio}</li>}
        {prompt.requires_reference_image && <li>Use a reference image</li>}
        {prompt.content.generation_notes && <li>{prompt.content.generation_notes}</li>}
      </ul></section>
      <section className="prompt-how-to"><h2>How to use</h2><p>Customize any variables, copy the composed prompt, and paste it into your image tool. Adjust the recommended settings to match your intended output.</p></section>
    </>}
  </main>;
}
