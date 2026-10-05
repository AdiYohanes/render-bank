import type { Metadata } from "next";

import Link from "next/link";

import { ArtworkFrame } from "@/app/components/artwork";
import { PromptGrid } from "@/app/components/prompt-grid";

import { siteUrl } from "@/config/site";
import {
  artworkUrl,
  discoverCategories,
  discoverPacks,
  discoverFeaturedPrompts,
  discoverPrompts,
  type DiscoveryPrompt,
} from "@/lib/discovery/public";
import { formatPackPrice } from "@/lib/payment/present";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description: "A curated library of tested prompts for better AI visuals.",
  openGraph: {
    title: "RenderBank",
    description: "A curated library of tested prompts for better AI visuals.",
    type: "website",
    url: "/",
  },
};

const emptyState = {
  q: "",
  category: "",
  model: "",
  orientation: "",
  access: "",
  page: 1,
};

function heroArt(prompts: DiscoveryPrompt[]) {
  for (const prompt of prompts) {
    const image =
      prompt.images?.find(({ is_primary }) => is_primary) ?? prompt.images?.[0];
    const asset = image?.media_assets;

    if (asset && artworkUrl(asset))
      return { prompt, asset, alt: image.alt_text };
  }

  return null;
}

export default async function Home() {
  const [featured, latest, categories, packs] = await Promise.all([
    discoverFeaturedPrompts(),
    discoverPrompts(emptyState),
    discoverCategories(),
    discoverPacks(),
  ]);
  const hero = heroArt(featured);
  const featuredIds = new Set(featured.map(({ id }) => id));
  const drops = latest.prompts
    .filter((prompt) => !featuredIds.has(prompt.id))
    .slice(0, 4);
  const pack = packs[0];
  const price = pack ? formatPackPrice(pack.price_minor, pack.currency) : null;
  const base = siteUrl().replace(/\/$/, "");
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RenderBank",
    url: `${base}/`,
  };

  return (
    <main className="content-wrap" id="main">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <section className="hero">
        <div>
          <p className="eyebrow">A visual-first Prompt library</p>
          <h1>Don&apos;t prompt from scratch.</h1>
          <p>Discover tested prompts for better AI visuals.</p>
          <div className="actions">
            <Link className="button-primary" href="/explore">
              Explore Prompts
            </Link>
            <Link className="button-secondary" href="/explore?access=free">
              Browse Free Prompts
            </Link>
          </div>
        </div>
        <div className={hero ? "hero-art has-art" : "hero-art"}>
          {hero ? (
            <ArtworkFrame priority alt={hero.alt} asset={hero.asset} />
          ) : (
            <span>Visuals in progress · Demo Content</span>
          )}
        </div>
      </section>
      {featured.length > 0 && (
        <section className="section">
          <div className="section-title">
            <div>
              <p className="eyebrow">DISCOVER</p>
              <h2>Featured Prompts</h2>
            </div>
            <Link href="/explore">
              Explore all <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <PromptGrid priority={hero ? undefined : true} prompts={featured} />
        </section>
      )}
      {categories.length > 0 && (
        <section className="section">
          <div className="section-title">
            <div>
              <p className="eyebrow">FIND YOUR DIRECTION</p>
              <h2>Browse by Category</h2>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                className="category-tile"
                href={`/category/${category.slug}`}
              >
                <span>Explore category</span>
                <strong>{category.name}</strong>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {drops.length > 0 && (
        <section className="section">
          <div className="section-title">
            <div>
              <p className="eyebrow">FRESH IDEAS</p>
              <h2>Latest Drops</h2>
            </div>
          </div>
          <PromptGrid prompts={drops} />
        </section>
      )}
      {pack && (
        <section className="section">
          <div className="section-title">
            <div>
              <p className="eyebrow">COLLECTIONS</p>
              <h2>Featured Prompt Pack</h2>
            </div>
          </div>
          <div className="pack-campaign">
            <div className="pack-campaign-cover">
              <ArtworkFrame alt={`${pack.title} cover`} asset={pack.cover} />
            </div>
            <div className="pack-campaign-body">
              <p className="eyebrow">One-time purchase</p>
              <h3>{pack.title}</h3>
              <p>{pack.description}</p>
              <dl className="pack-meta">
                <div>
                  <dt>Prompts</dt>
                  <dd>{pack.prompt_count?.[0]?.count ?? 0}</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>{price}</dd>
                </div>
              </dl>
              <Link className="button-secondary" href={`/packs/${pack.slug}`}>
                View Pack
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
