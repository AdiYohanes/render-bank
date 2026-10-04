import type { Metadata } from "next";

import Link from "next/link";

import { ExploreControls } from "../components/explore-controls";
import { PromptGrid } from "../components/prompt-grid";

import {
  discoverCategories,
  discoverModels,
  discoverPrompts,
} from "@/lib/discovery/public";
import { siteUrl } from "@/config/site";
import { discoveryHref, discoveryState } from "@/lib/discovery/url";

export const metadata: Metadata = {
  title: "Explore Prompts",
  description: "Browse public visual Prompts by category, model and style.",
  alternates: { canonical: "/explore" },
  openGraph: {
    title: "Explore Prompts",
    description: "Browse public visual Prompts by category, model and style.",
    type: "website",
    url: "/explore",
  },
};

export default async function Explore({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = discoveryState(await searchParams);
  const [results, categories, models] = await Promise.all([
    discoverPrompts(state),
    discoverCategories(),
    discoverModels(),
  ]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Explore Prompts",
    url: `${siteUrl().replace(/\/$/, "")}/explore`,
  };

  return (
    <main className="content-wrap explore-page" id="main">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <p className="eyebrow">THE PROMPT LIBRARY</p>
      <h1>Explore Prompts</h1>
      <p className="page-intro">
        Find a starting point for your next visual idea.
      </p>
      <ExploreControls categories={categories} models={models} state={state} />
      {results.prompts.length ? (
        <>
          <p className="results-label">
            Showing {results.prompts.length} Prompts
          </p>
          <PromptGrid prompts={results.prompts} />
          {results.hasMore && (
            <Link
              className="button-secondary load-more"
              href={discoveryHref(state, { page: state.page + 1 })}
            >
              Load more Prompts
            </Link>
          )}
        </>
      ) : (
        <section className="empty-state">
          <h2>
            {state.q ? "No prompts found." : "No prompts match these filters."}
          </h2>
          <p>Try a different search or explore the full library.</p>
          <div className="actions">
            {state.q && (
              <Link href={discoveryHref(state, { q: "", page: 1 })}>
                Clear Search
              </Link>
            )}
            <Link href="/explore">Explore All</Link>
          </div>
        </section>
      )}
    </main>
  );
}
