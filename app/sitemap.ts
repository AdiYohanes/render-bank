import type { MetadataRoute } from "next";

import { discoverCategories } from "@/lib/discovery/public";
import { siteUrl } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().replace(/\/$/, "");
  let categories: { slug: string }[] = [];

  try {
    categories = await discoverCategories();
  } catch {
    // Sitemap degrades to static routes when discovery is unavailable.
  }
  const staticRoutes = ["/", "/explore", "/about"];

  return [
    ...staticRoutes,
    ...categories.map(({ slug }) => `/category/${slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
