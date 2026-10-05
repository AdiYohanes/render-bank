import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ArtworkFrame } from "@/app/components/artwork";
import { artworkUrl, findPackDetail } from "@/lib/discovery/public";
import { formatPackPrice, packDetail } from "@/lib/payment/present";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pack = await findPackDetail(slug);
  if (!pack) return { robots: { index: false } };
  const path = `/packs/${pack.slug}`;
  const coverSrc = artworkUrl(pack.cover);
  return {
    title: pack.title,
    description: pack.description,
    alternates: { canonical: path },
    openGraph: {
      title: pack.title,
      description: pack.description,
      url: path,
      images: coverSrc && pack.cover ? [{ url: coverSrc, width: pack.cover.width, height: pack.cover.height, alt: pack.title }] : undefined,
    },
  };
}

export default async function PackDetail({ params }: Props) {
  const { slug } = await params;
  const pack = await findPackDetail(slug);
  if (!pack) notFound();
  const detail = packDetail(pack);
  const price = formatPackPrice(pack.priceMinor, pack.currency);

  return (
    <main className="content-wrap pack-detail-page" id="main">
      <section className="pack-detail-hero">
        <div className="pack-detail-artwork prompt-artwork">
          <ArtworkFrame alt={`${detail.title} cover`} asset={pack.cover} priority />
        </div>
        <div className="pack-detail-intro">
          <p className="eyebrow">ONE-TIME PURCHASE</p>
          <h1>{detail.title}</h1>
          <p>{detail.description}</p>
          <dl className="pack-meta">
            {detail.models.length > 0 && (
              <div>
                <dt>Models</dt>
                <dd>{detail.models.join(", ")}</dd>
              </div>
            )}
            <div>
              <dt>Prompts</dt>
              <dd>{detail.promptCount}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{price}</dd>
            </div>
          </dl>
          <div className="actions">
            <Link className="button-primary" href={`/checkout/${detail.slug}`}>
              Buy Pack
            </Link>
          </div>
        </div>
      </section>

      <section className="pack-what-you-get">
        <h2>What you get</h2>
        <ul>
          <li>{detail.promptCount} tested Prompts in one Pack</li>
          {detail.useCases.length > 0 && <li>Use cases: {detail.useCases.join(", ")}</li>}
          <li>One-time purchase — no subscription</li>
          <li>Lifetime access to your purchased Pack</li>
        </ul>
      </section>

      {detail.examples.length > 0 && (
        <section className="pack-examples">
          <h2>Visual examples</h2>
          <div className="pack-example-grid">
            {detail.examples.slice(0, 4).map(({ asset, alt }, index) => (
              <div className="prompt-artwork" key={index} style={{ aspectRatio: "4 / 3" }}>
                <ArtworkFrame alt={alt} asset={asset} priority={index < 2} />
              </div>
            ))}
          </div>
        </section>
      )}

      {detail.previews.length > 0 && (
        <section className="pack-included">
          <h2>Included Prompts</h2>
          <p className="page-intro">
            A look at what&apos;s inside. Full Prompt recipes unlock after purchase.
          </p>
          <ul className="pack-preview-list">
            {detail.previews.map((preview) => (
              <li key={preview.href}>
                <Link className="pack-preview-item" href={preview.href}>
                  <strong>{preview.title}</strong>
                  <span>{preview.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="pack-access-note">
        <h2>How access works</h2>
        <p>
          Pay once. Access your purchased Prompts through a secure link sent to
          your email — no account needed.
        </p>
      </section>

      <section className="pack-cta-final">
        <h2>Ready to create?</h2>
        <Link className="button-primary" href={`/checkout/${detail.slug}`}>
          Buy Pack — {price}
        </Link>
        <Link className="pack-explore-link" href="/explore">
          Explore more Prompts
        </Link>
      </section>
    </main>
  );
}
