import type { Metadata } from "next";

import Link from "next/link";

import { ArtworkFrame } from "@/app/components/artwork";
import { discoverPacks } from "@/lib/discovery/public";
import { packCatalog } from "@/lib/payment/present";

export const metadata: Metadata = {
  title: "Prompt Packs",
  description: "Curated one-time-purchase Prompt Packs for tested commercial AI visuals.",
  alternates: { canonical: "/packs" },
  openGraph: {
    title: "Prompt Packs | RenderBank",
    description: "Curated one-time-purchase Prompt Packs for tested commercial AI visuals.",
    type: "website",
    url: "/packs",
  },
};

export default async function Packs() {
  const packs = packCatalog(await discoverPacks());

  return (
    <main className="content-wrap packs-page" id="main">
      <p className="eyebrow">COLLECTIONS</p>
      <h1>Curated Prompt Packs</h1>
      <p className="page-intro">
        Hand-picked Prompt Packs for a finished commercial look. Every Pack is
        a one-time purchase.
      </p>
      {packs.length ? (
        <div className={packs.length === 1 ? "pack-hero" : "pack-grid"}>
          {packs.map((pack, index) => (
            <section className="pack-card" key={pack.href}>
              <div className="pack-card-cover" style={{ aspectRatio: "4 / 3" }}>
                <ArtworkFrame
                  alt={`${pack.title} cover`}
                  asset={pack.cover}
                  priority={index === 0}
                />
              </div>
              <div className="pack-card-body">
                <p className="eyebrow">ONE-TIME PURCHASE</p>
                <h2>{pack.title}</h2>
                <p>{pack.description}</p>
                <dl className="pack-meta">
                  <div>
                    <dt>Prompts</dt>
                    <dd>{pack.promptCount}</dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd>{pack.price}</dd>
                  </div>
                </dl>
                <Link className="button-primary" href={pack.href}>
                  View Pack
                </Link>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>Packs are being curated.</h2>
          <p>The first Prompt Packs are in preparation. Meanwhile, browse the free library.</p>
          <Link className="button-primary" href="/explore?access=free">
            Explore Free Prompts
          </Link>
        </section>
      )}
    </main>
  );
}
