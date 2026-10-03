import type { Metadata } from "next";
import Link from "next/link";

import { PromptGrid } from "./components/prompt-grid";
import { discoverCategories, discoverPacks, discoverPrompts } from "@/lib/discovery/public";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [featured, categories, packs] = await Promise.all([
    discoverPrompts({ q: "", category: "", model: "", orientation: "", access: "", page: 1 }),
    discoverCategories(), discoverPacks(),
  ]);
  return <main id="main" className="content-wrap">
    <section className="hero"><div><p className="eyebrow">A visual-first Prompt library</p><h1>Don&apos;t prompt from scratch.</h1><p>Explore curated Prompt ideas for better AI visuals.</p><div className="actions"><Link className="button-primary" href="/explore">Explore Prompts</Link><Link className="button-secondary" href="/explore?access=free">Browse Free Prompts</Link></div></div><div className="hero-art" role="img" aria-label="Preview artwork will appear when curated visuals are available"><span>Visuals in progress · Demo Content</span></div></section>
    {featured.prompts.length > 0 && <section className="section"><div className="section-title"><div><p className="eyebrow">DISCOVER</p><h2>Featured Prompts</h2></div><Link href="/explore">Explore all <span aria-hidden="true">↗</span></Link></div><PromptGrid prompts={featured.prompts.slice(0, 4)} /></section>}
    {categories.length > 0 && <section className="section"><div className="section-title"><div><p className="eyebrow">FIND YOUR DIRECTION</p><h2>Browse by Category</h2></div></div><div className="category-grid">{categories.map((category) => <Link href={`/category/${category.slug}`} key={category.id} className="category-tile"><span>Explore category</span><strong>{category.name}</strong><span aria-hidden="true">↗</span></Link>)}</div></section>}
    {featured.prompts.length > 4 && <section className="section"><div className="section-title"><div><p className="eyebrow">FRESH IDEAS</p><h2>Latest Drops</h2></div></div><PromptGrid prompts={featured.prompts.slice(4, 8)} /></section>}
    {packs.length > 0 && <section className="section"><div className="section-title"><div><p className="eyebrow">COLLECTIONS</p><h2>Featured Prompt Packs</h2></div></div><div className="pack-feature">{packs.map((pack) => <div key={pack.slug}><p className="eyebrow">Demo Content · Not available for purchase</p><h3>{pack.title}</h3><p>{pack.description}</p><Link className="button-secondary" href={`/packs/${pack.slug}`}>View Prompt Pack</Link></div>)}</div></section>}
  </main>;
}
