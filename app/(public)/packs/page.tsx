import type { Metadata } from "next";

import Link from "next/link";

import { discoverPacks } from "@/lib/discovery/public";

export const metadata: Metadata = {
  title: "Prompt Packs",
  robots: { index: false, follow: false },
};

export default async function Packs() {
  const packs = await discoverPacks();

  return (
    <main className="content-wrap interim-page" id="main">
      <p className="eyebrow">COLLECTIONS</p>
      <h1>Prompt Packs</h1>
      <p>
        Curated collections are taking shape. Purchases aren&apos;t available
        yet.
      </p>
      {packs.map((pack) => (
        <div key={pack.slug} className="pack-feature">
          <h2>{pack.title}</h2>
          <p>{pack.description}</p>
          <Link href={`/packs/${pack.slug}`}>Preview this Prompt Pack ↗</Link>
        </div>
      ))}
      <Link className="button-primary" href="/explore?access=free">
        Explore Free Prompts
      </Link>
    </main>
  );
}
