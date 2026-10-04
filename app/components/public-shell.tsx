import Link from "next/link";
import { Suspense } from "react";

import { DesktopNav, MobileNav } from "./header-nav";
import { PublicSearch } from "./header-search";

import { discoverCategories } from "@/lib/discovery/public";

function StaticHeader() {
  return (
    <div className="site-header-inner">
      <Link className="wordmark" href="/">
        RenderBank
      </Link>
      <nav aria-label="Main navigation" className="desktop-nav">
        <Link href="/explore">Explore</Link>
        <Link href="/packs">Packs</Link>
      </nav>
      <PublicSearch />
    </div>
  );
}

async function CategoryNav() {
  let categories: { id: string; slug: string; name: string }[] = [];

  try {
    categories = await discoverCategories();
  } catch {
    // Discovery unavailable: shell stays usable; category navigation degrades.
  }

  return (
    <>
      <DesktopNav categories={categories} />
      <MobileNav categories={categories} />
    </>
  );
}

export function PublicHeader() {
  return (
    <header className="site-header">
      <Suspense fallback={<StaticHeader />}>
        <div className="site-header-inner">
          <Link className="wordmark" href="/">
            RenderBank
          </Link>
          <CategoryNav />
          <PublicSearch />
        </div>
      </Suspense>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>
          <strong>RenderBank</strong>
          <br />
          Visual-first Prompt discovery.
        </p>
        <nav aria-label="Footer">
          <Link href="/explore">Explore</Link>
          <Link href="/packs">Packs</Link>
          <Link href="/about">About</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
