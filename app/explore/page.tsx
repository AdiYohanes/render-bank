import type { Metadata } from "next";
import Link from "next/link";

import { PromptGrid } from "../components/prompt-grid";
import { discoverCategories, discoverModels, discoverPrompts } from "@/lib/discovery/public";
import { discoveryHref, discoveryState } from "@/lib/discovery/url";

export const metadata: Metadata = { title: "Explore Prompts", description: "Browse public visual Prompts by category, model and style.", alternates: { canonical: "/explore" } };

export default async function Explore({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const state = discoveryState(await searchParams);
  const [results, categories, models] = await Promise.all([discoverPrompts(state), discoverCategories(), discoverModels()]);
  const filtered = state.category || state.model || state.orientation || state.access;
  return <main id="main" className="content-wrap explore-page"><p className="eyebrow">THE PROMPT LIBRARY</p><h1>Explore Prompts</h1><p className="page-intro">Find a starting point for your next visual idea.</p>
    <form action="/explore" className="discovery-form" role="search"><div className="search-row"><label htmlFor="explore-q">Search prompts</label><div><input id="explore-q" type="search" name="q" defaultValue={state.q} placeholder="Search prompts..." maxLength={100} /><button className="button-primary" type="submit">Search</button></div></div>
      <details className="filter-disclosure" open><summary>Filters {filtered ? "· Active" : ""}</summary><div className="filters">
        <label>Category<select name="category" defaultValue={state.category}><option value="">All categories</option>{categories.map((category) => <option value={category.slug} key={category.id}>{category.name}</option>)}</select></label>
        <label>Model<select name="model" defaultValue={state.model}><option value="">All models</option>{models.map((model) => <option value={model.slug} key={model.slug}>{model.name}</option>)}</select></label>
        <label>Orientation<select name="orientation" defaultValue={state.orientation}><option value="">Any orientation</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option><option value="square">Square</option></select></label>
        <label>Access<select name="access" defaultValue={state.access}><option value="">All access</option><option value="free">Free</option><option value="premium">Premium</option></select></label>
        <button className="button-secondary" type="submit">Apply Filters</button>
      </div></details>
    </form>
    {(state.q || filtered) && <div className="active-filters"><span>Showing {state.q ? `“${state.q}”` : "all Prompts"}{filtered ? " with active filters" : ""}</span>{state.q && <Link href={discoveryHref(state, { q: "", page: 1 })}>Clear Search</Link>}<Link href="/explore">Clear Filters</Link></div>}
    {results.prompts.length ? <><p className="results-label">Prompt results · Page {state.page}</p><PromptGrid prompts={results.prompts} />{results.hasMore && <Link className="button-secondary load-more" href={discoveryHref(state, { page: state.page + 1 })}>Load more Prompts</Link>}</> : <section className="empty-state"><h2>{state.q ? "No prompts found." : "No prompts match these filters."}</h2><p>Try a different search or explore the full library.</p><div className="actions">{state.q && <Link href={discoveryHref(state, { q: "", page: 1 })}>Clear Search</Link>}<Link href="/explore">{state.q ? "Explore All" : "Clear Filters"}</Link></div></section>}
  </main>;
}
