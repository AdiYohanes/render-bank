import Link from "next/link";

import { discoverCategories } from "@/lib/discovery/public";

export async function PublicHeader() {
  const categories = await discoverCategories();
  return <header className="site-header"><div className="site-header-inner">
    <Link className="wordmark" href="/">RenderBank</Link>
    <nav className="desktop-nav" aria-label="Main navigation"><Link href="/explore">Explore</Link><details className="category-menu"><summary>Categories</summary><div>{categories.map((category) => <Link href={`/category/${category.slug}`} key={category.id}>{category.name}</Link>)}</div></details><Link href="/packs">Packs</Link></nav>
    <form action="/explore" role="search" className="header-search"><label className="sr-only" htmlFor="header-q">Search prompts</label><input id="header-q" type="search" name="q" placeholder="Search prompts..." maxLength={100} /><button type="submit">Search</button></form>
    <details className="mobile-nav"><summary>Menu</summary><nav aria-label="Mobile navigation"><Link href="/explore">Explore</Link><span>Categories</span>{categories.map((category) => <Link href={`/category/${category.slug}`} key={category.id}>{category.name}</Link>)}<Link href="/packs">Packs</Link></nav></details>
  </div></header>;
}

export function PublicFooter() {
  return <footer className="site-footer"><div className="site-footer-inner"><p><strong>RenderBank</strong><br />Visual-first Prompt discovery.</p><nav aria-label="Footer"><Link href="/explore">Explore</Link><Link href="/packs">Packs</Link><Link href="/about">About</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></nav></div></footer>;
}
