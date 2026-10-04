import type { MetadataRoute } from "next";

import { discoverCategories, discoverPacks } from "@/lib/discovery/public";
import { discoverPromptSlugs } from "@/lib/prompts/public";
import { siteUrl } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().replace(/\/$/, "");
  let categories: { slug: string }[] = [];
  let prompts: { slug: string }[] = [];
  let packs: { slug: string }[] = [];

  try {
    categories = await discoverCategories();
  } catch {
    // Sitemap degrades to available public routes when discovery is unavailable.
  }
  try {
    prompts = await discoverPromptSlugs();
  } catch {
    // Prompt discovery failure does not hide available category routes.
  }
  try {
    packs = (await discoverPacks()).map(({ slug }) => ({ slug }));
  } catch {
    // Pack discovery failure does not hide available public routes.
  }
  const staticRoutes = ["/", "/explore", "/packs", "/about"];

  return [
    ...staticRoutes,
    ...categories.map(({ slug }) => `/category/${slug}`),
    ...packs.map(({ slug }) => `/packs/${slug}`),
    ...prompts.map(({ slug }) => `/prompts/${slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
