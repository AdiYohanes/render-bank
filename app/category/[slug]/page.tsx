import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { PromptGrid } from "../../components/prompt-grid";

import { siteUrl } from "@/config/site";
import { discoverPrompts, findCategory } from "@/lib/discovery/public";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategory(slug);

  if (!category)
    return { title: "Category not found", robots: { index: false } };
  const description =
    category.description ?? `Discover ${category.name} Prompts.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: category.name,
      description,
      type: "website",
      url: `/category/${slug}`,
    },
  };
}

export default async function Category({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await findCategory(slug);

  if (!category) notFound();
  const results = await discoverPrompts({
    q: "",
    category: slug,
    model: "",
    orientation: "",
    access: "",
    page: 1,
  });

  if (!results.prompts.length) notFound();
  const base = siteUrl().replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    url: `${base}/category/${slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: results.prompts.map((prompt, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${base}/explore?category=${slug}`,
        name: prompt.title,
      })),
    },
  };

  return (
    <main
      className={`content-wrap category-page${results.prompts.length <= 2 ? " category-compact" : ""}`}
      id="main"
    >
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <p className="eyebrow">BROWSE BY CATEGORY</p>
      <h1>{category.name}</h1>
      <p className="page-intro">
        {category.description ?? `Explore visual Prompts for ${category.name}.`}
      </p>
      <PromptGrid prompts={results.prompts} />
      {results.hasMore && (
        <Link
          className="button-secondary load-more"
          href={`/explore?category=${slug}&page=2`}
        >
          Explore more {category.name} Prompts
        </Link>
      )}
      <p className="category-more">
        <Link href="/explore">Explore all Prompts ↗</Link>
      </p>
    </main>
  );
}
